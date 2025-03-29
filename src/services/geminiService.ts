import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from "@google/generative-ai";
import * as pdfjsLib from 'pdfjs-dist';
import { configurePdfJs, setPdfOptions } from '@/utils/pdfConfig';

// تنظیم کانفیگ pdfjs
configurePdfJs();

// تعریف interface ها و type ها
interface Position {
  x: number;
  y: number;
}

interface NodeData {
  label: string;
  level: number;
}

interface Node {
  id: string;
  type: string;
  position: Position;
  data: NodeData;
  style: {
    background: string;
    border: string;
    padding: number;
    borderRadius: number;
    minWidth: number;
    fontSize: number;
    textAlign: 'center';
    boxShadow: string;
    color: string;
    zIndex: number;
  };
}

interface Edge {
  id: string;
  source: string;
  target: string;
  type: string;
  animated: boolean;
  style: {
    stroke: string;
    strokeWidth: number;
    opacity: number;
  };
}

interface FlowResult {
  nodes: Node[];
  edges: Edge[];
}

// تنظیم Gemini API
const GEMINI_API_KEY: string = "AIzaSyAwzz-_Xf6XJYGbmC9Se_KxJD6h7LDIw2g";
const genAI: GoogleGenerativeAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * پاکسازی و استخراج کد Mermaid از پاسخ
 */
const cleanMermaidCode = (responseText: string): string => {
    let cleaned: string = responseText.replace(/```mermaid\s*|\s*```/g, '');
    
    let lines: string[] = cleaned.split('\n')
        .filter((line: string): boolean => line.trim().length > 0)
        .map((line: string): string => {
            line = line.replace(/\((.*?)\((.*?)\)\)/, '($1 $2)');
            
            while (line.includes('((') || line.includes('))')) {
                line = line.replace('((', '(').replace('))', ')');
            }
            
            const parts: string[] = line.split('(');
            if (parts.length > 2) {
                const mainPart: string = parts[0];
                const contentParts: string[] = parts.slice(1).map(p => p.trim().replace(')', ''));
                line = `${mainPart}(${contentParts.join(' ')})`;
            }
            
            return line;
        });
    
    let result: string = lines.join('\n');
    if (!result.trim().startsWith('mindmap')) {
        result = 'mindmap\n' + result;
    }
    
    return result;
};

/**
 * تبدیل متن به کد Mermaid
 */
export const generateMermaidCode = async (inputText: string): Promise<string> => {
    try {
        console.debug("Starting generateMermaidCode with input:", inputText.slice(0, 100));
        
        const generationConfig: GenerationConfig = {
            temperature: 1,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
        };

        const model: GenerativeModel = genAI.getGenerativeModel({
            model: "gemini-1.5-pro",
            generationConfig,
        });
        
        const prompt: string = `
        لطفاً متن زیر را به یک نمودار ذهنی (mindmap) در Mermaid تبدیل کن. این نمودار باید:

        1.  تمام جزئیات متن را به طور کامل پوشش دهد و هیچ اطلاعات مهمی را از قلم نیندازد.
        2.  هر شاخه را با توضیحات کافی و جزئیات مرتبط پر کند، و از خلاصه شدن بیش از حد مطالب جلوگیری شود.
        3.  ساختار سلسله مراتبی با عمق مناسب (2-3 سطح) و دسته‌بندی منطقی داشته باشد.
        4.  توضیحات هر گره، جامع و کامل بوده و مرتبط با موضوع اصلی باشد.
        5.  از جملات و عبارات نسبتاً کوتاه برای توصیف هر شاخه استفاده کن تا از طولانی شدن بیش از حد آن‌ها جلوگیری شود.
        6. هر عبارت را در یک پرانتز ساده قرار بده، از پرانتز تودرتو استفاده نکن.
       
        قوانین فنی:
        - فقط کد Mermaid را برگردان.
        - کد را با دستور mindmap شروع کن.
        - از root(()) برای گره اصلی استفاده کن.
        - برای ساختار از [دسته اصلی] و (زیردسته) استفاده کن.
        - هر عبارت داخل پرانتز باید ساده باشد، بدون پرانتز اضافی.
        - هیچ توضیح اضافه یا متن دیگری اضافه نکن.

        متن برای تبدیل:
        ${inputText}`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        
        if (response && response.text()) {
            const text: string = await response.text();
            const cleanedCode: string = cleanMermaidCode(text);
            console.debug("Cleaned mermaid code:", cleanedCode.slice(0, 100));
            return cleanedCode;
        } else {
            throw new Error("پاسخی از مدل دریافت نشد");
        }
            
    } catch (error) {
        console.error("Detailed error in generateMermaidCode:", error);
        throw new Error(`خطا در تولید کد Mermaid: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * تبدیل کد Mermaid به فرمت React Flow
 */
export const mermaidToReactflow = (mermaidCode: string): FlowResult => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const levelParents: { [key: number]: number } = {};
    let nodeId: number = 0;

    const colors: string[] = [
        '#0EA5E9', '#F97316', '#22C55E', '#D946EF',
        '#6366F1', '#14B8A6', '#F59E0B', '#8B5CF6'
    ];

    const lines: string[] = mermaidCode.split('\n')
        .slice(1)
        .filter(line => line.trim());

    const levelNodes: { [key: number]: number } = {};
    const childrenCount: { [key: number]: number } = {};
    
    // تحلیل ساختار درخت
    lines.forEach((line: string) => {
        const indent: number = line.search(/\S/);
        const level: number = Math.floor(indent / 2);
        levelNodes[level] = (levelNodes[level] || 0) + 1;
        
        if (level > 0) {
            const parentLevel: number = level - 1;
            childrenCount[parentLevel] = (childrenCount[parentLevel] || 0) + 1;
        }
    });

    const VERTICAL_SPACING: number = 100;
    const HORIZONTAL_SPACING: number = 250;
    const SIBLING_SPACING: number = 80;

    const usedPositions: Set<string> = new Set();

    const hasOverlap = (x: number, y: number): boolean => {
        for (const pos of usedPositions) {
            const [px, py] = pos.split(',').map(Number);
            const distance: number = Math.sqrt(Math.pow(x - px, 2) + Math.pow(y - py, 2));
            if (distance < 150) return true;
        }
        return false;
    };

    const findSuitablePosition = (baseX: number, baseY: number): Position => {
        let x: number = baseX;
        let y: number = baseY;
        let attempt: number = 0;
        const radius: number = 50;

        while (hasOverlap(x, y) && attempt < 20) {
            const angle: number = (attempt * Math.PI) / 10;
            const distance: number = radius * (1 + Math.floor(attempt / 20));
            x = baseX + distance * Math.cos(angle);
            y = baseY + distance * Math.sin(angle);
            attempt++;
        }

        return { x, y };
    };

    const currentLevelWidth: { [key: number]: number } = {};

    lines.forEach((line: string, index: number) => {
        const indent: number = line.search(/\S/);
        const level: number = Math.floor(indent / 2);

        const text: string = line.trim()
            .replace(/^root\((.*?)\)$/, '$1')
            .replace(/^\((.*?)\)$/, '$1')
            .replace(/^\[(.*?)\]$/, '$1');

        let baseX: number, baseY: number;
        if (level === 0) {
            baseX = 0;
            baseY = 0;
        } else {
            const parentId = levelParents[level - 1];
            const parentNode = nodes.find(n => n.id === parentId?.toString());
            
            if (parentNode) {
                const siblingCount: number = levelNodes[level] || 1;
                const siblingIndex: number = (currentLevelWidth[level] || 0);
                
                baseX = parentNode.position.x + HORIZONTAL_SPACING;
                baseY = parentNode.position.y - ((siblingCount - 1) * SIBLING_SPACING / 2) 
                      + siblingIndex * SIBLING_SPACING;
            } else {
                baseX = level * HORIZONTAL_SPACING;
                baseY = 0;
            }
        }

        const { x, y } = findSuitablePosition(baseX, baseY);
        usedPositions.add(`${x},${y}`);

        currentLevelWidth[level] = (currentLevelWidth[level] || 0) + 1;

        const nodeColor: string = colors[level % colors.length];
        const minWidth: number = Math.max(120, text.length * 8);

        const node: Node = {
            id: nodeId.toString(),
            type: 'default',
            position: { x, y },
            data: { label: text, level },
            style: {
                background: `${nodeColor}22`,
                border: `1px solid ${nodeColor}`,
                padding: 10,
                borderRadius: 15,
                minWidth,
                fontSize: 12,
                textAlign: 'center',
                boxShadow: `0 2px 4px ${nodeColor}33`,
                color: nodeColor,
                zIndex: 1000 - level
            }
        };
        nodes.push(node);

        if (level > 0) {
            const parentId = levelParents[level - 1];
            if (parentId !== undefined) {
                edges.push({
                    id: `e${parentId}-${nodeId}`,
                    source: parentId.toString(),
                    target: nodeId.toString(),
                    type: 'smoothstep',
                    animated: false,
                    style: {
                        stroke: nodeColor,
                        strokeWidth: 1.5,
                        opacity: 0.7
                    }
                });
            }
        }

        levelParents[level] = nodeId;
        nodeId++;
    });

    // مرکزی کردن نمودار
    if (nodes.length > 0) {
        const xValues: number[] = nodes.map(node => node.position.x);
        const yValues: number[] = nodes.map(node => node.position.y);
        const minX: number = Math.min(...xValues);
        const maxX: number = Math.max(...xValues);
        const minY: number = Math.min(...yValues);
        const maxY: number = Math.max(...yValues);
        const centerX: number = (minX + maxX) / 2;
        const centerY: number = (minY + maxY) / 2;

        nodes.forEach(node => {
            node.position.x -= centerX;
            node.position.y -= centerY;
        });
    }

    return { nodes, edges };
};

/**
 * تشخیص متن‌های مهم برای هایلایت کردن
 * ورودی: متن کامل یک صفحه
 * خروجی: آرایه‌ای از متن‌های مهم که باید هایلایت شوند
 */
export const identifyImportantText = async (pageText: string): Promise<string[]> => {
    try {
        console.debug("Starting identifyImportantText with input:", pageText.slice(0, 100));
        
        const generationConfig: GenerationConfig = {
            temperature: 0.2,
            topP: 1,
            topK: 32,
            maxOutputTokens: 8192,
        };
        
        const promptText = `
لطفاً متن زیر را تحلیل کنید و مهم‌ترین بخش‌های آن را استخراج کنید. 
فقط عبارات مهم را برگردانید، خلاصه‌سازی نکنید. 
هر عبارت مهم را در یک خط جداگانه قرار دهید، بدون هرگونه شماره‌گذاری یا نشانه‌گذاری اضافی.
هر عبارت باید به صورت دقیق و کامل از متن اصلی استخراج شده باشد.

متن:
${pageText}
        `;
        
        // استفاده از مدل جدید با نسخه به‌روز شده
        const model: GenerativeModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: promptText }] }],
            generationConfig,
        });
        
        // استخراج خطوط بدون خالی
        const responseText = result.response.text().trim();
        const importantPhrases = responseText
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
        
        console.debug(`Identified ${importantPhrases.length} important phrases`);
        return importantPhrases;
    } catch (error) {
        console.error("Error in identifyImportantText:", error);
        return [];
    }
};

/**
 * استخراج متن از تصویر
 */
export const extractTextFromImage = async (imageFile: File): Promise<string> => {
    try {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onload = async (e) => {
                if (!e.target?.result) {
                    reject(new Error("خطا در خواندن فایل تصویر"));
                    return;
                }

                const imageData = e.target.result as string;
                try {
                    const model = genAI.getGenerativeModel({
                        model: "gemini-2.0-flash",
                    });

                    // استخراج بخش base64 از data URL
                    const base64Data = imageData.split(',')[1];
                    const mimeType = imageData.split(';')[0].split(':')[1];

                    const result = await model.generateContent([
                        {
                            text: "لطفاً تمام متن را از این تصویر استخراج کن. فقط متن را برگردان، بدون هیچ توضیح اضافی."
                        },
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: base64Data
                            }
                        }
                    ]);

                    const text = result.response.text();
                    resolve(text);
                } catch (error) {
                    console.error("Error in OCR:", error);
                    reject(new Error(`خطا در OCR: ${error instanceof Error ? error.message : 'خطای ناشناخته'}`));
                }
            };
            reader.onerror = () => {
                reject(new Error("خطا در خواندن فایل تصویر"));
            };
            reader.readAsDataURL(imageFile);
        });
    } catch (error) {
        console.error("Error reading image file:", error);
        throw new Error(`خطا در خواندن فایل تصویر: ${error instanceof Error ? error.message : 'خطای ناشناخته'}`);
    }
};

/**
 * تاخیر در اجرای کد با مقدار مشخص میلی‌ثانیه
 */
const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * استخراج متن از PDF با استفاده از OCR (Gemini Flash-2)
 * این تابع هر صفحه PDF را به تصویر تبدیل کرده و با Gemini OCR می‌کند
 * با اعمال محدودیت و تاخیر برای جلوگیری از خطای rate limit
 */
export const extractTextFromPdfWithOCR = async (pdfUrl: string, onProgress?: (progress: number) => void): Promise<string> => {
    try {
        console.log('Extracting text from PDF with OCR:', pdfUrl);
        
        // دریافت سند PDF
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        console.log(`PDF loaded with ${pdf.numPages} pages for OCR`);
        
        let fullText = '';
        
        // تنظیمات دسته‌بندی و تاخیر
        const BATCH_SIZE = 5; // تعداد صفحات در هر دسته
        const DELAY_BETWEEN_PAGES = 3000; // تاخیر بین هر صفحه (3 ثانیه)
        const DELAY_BETWEEN_BATCHES = 10000; // تاخیر بین هر دسته (10 ثانیه)
        const MAX_RETRIES = 3; // حداکثر تعداد تلاش‌های مجدد
        
        // تعداد کل صفحات
        const totalPages = pdf.numPages;
        
        // پردازش صفحات به صورت دسته‌ای
        for (let batchStart = 1; batchStart <= totalPages; batchStart += BATCH_SIZE) {
            // محاسبه آخرین صفحه در این دسته
            const batchEnd = Math.min(batchStart + BATCH_SIZE - 1, totalPages);
            console.log(`Processing batch from page ${batchStart} to ${batchEnd}`);
            
            // پردازش هر صفحه در دسته فعلی
            for (let i = batchStart; i <= batchEnd; i++) {
                // گزارش درصد پیشرفت
                const progress = Math.round((i - 1) / totalPages * 100);
                if (onProgress) {
                    onProgress(progress);
                }
                
                let pageText = '';
                let retryCount = 0;
                let success = false;
                
                // سعی مجدد در صورت خطا
                while (!success && retryCount <= MAX_RETRIES) {
                    try {
                        const page = await pdf.getPage(i);
                        const viewport = page.getViewport({ scale: 2.0 }); // مقیاس بالاتر برای وضوح بهتر OCR
                        
                        // ایجاد canvas برای رندر صفحه
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;
                        
                        if (!context) {
                            throw new Error('خطا در ایجاد context کانواس');
                        }
                        
                        // رندر صفحه به canvas
                        await page.render({
                            canvasContext: context,
                            viewport: viewport
                        }).promise;
                        
                        // تبدیل canvas به blob
                        const imageBlob = await new Promise<Blob>((resolve) => {
                            canvas.toBlob((blob) => {
                                if (blob) resolve(blob);
                                else throw new Error('خطا در تبدیل canvas به blob');
                            }, 'image/png');
                        });
                        
                        // تبدیل blob به فایل
                        const imageFile = new File([imageBlob], `page-${i}.png`, { type: 'image/png' });
                        
                        // فراخوانی OCR برای تصویر با تاخیر قبل از درخواست
                        console.log(`Processing OCR for page ${i} (attempt ${retryCount + 1})`);
                        pageText = await extractTextFromImage(imageFile);
                        
                        // اگر به اینجا برسیم، یعنی OCR موفقیت‌آمیز بوده است
                        success = true;
                        console.log(`Completed OCR for page ${i}`);
                    } catch (error) {
                        retryCount++;
                        console.warn(`Attempt ${retryCount} failed for page ${i}:`, error);
                        
                        if (retryCount <= MAX_RETRIES) {
                            // افزایش زمان تاخیر با هر تلاش مجدد (تاخیر نمایی)
                            const retryDelay = DELAY_BETWEEN_PAGES * Math.pow(2, retryCount);
                            console.log(`Retrying page ${i} after ${retryDelay}ms...`);
                            await sleep(retryDelay);
                        } else {
                            // اگر همه تلاش‌ها ناموفق بود، خطا را گزارش می‌کنیم
                            console.error(`Failed to process page ${i} after ${MAX_RETRIES} attempts.`);
                            // فقط پیام خطا بدون توقف کامل پردازش
                            pageText = `[خطا در OCR صفحه ${i}]`;
                        }
                    }
                }
                
                fullText += `===== صفحه ${i} =====\n${pageText}\n\n`;
                
                // تاخیر بین صفحات برای جلوگیری از rate limit
                if (i < batchEnd) {
                    console.log(`Waiting ${DELAY_BETWEEN_PAGES}ms before processing next page...`);
                    await sleep(DELAY_BETWEEN_PAGES);
                }
            }
            
            // تاخیر بین دسته‌ها برای جلوگیری از rate limit
            if (batchEnd < totalPages) {
                console.log(`Completed batch. Waiting ${DELAY_BETWEEN_BATCHES}ms before starting next batch...`);
                await sleep(DELAY_BETWEEN_BATCHES);
            }
        }
        
        // گزارش تکمیل پیشرفت (100%)
        if (onProgress) {
            onProgress(100);
        }
        
        console.log('PDF OCR processing completed');
        return fullText;
    } catch (error) {
        console.error('Error performing OCR on PDF:', error);
        throw new Error(`خطا در OCR سند PDF: ${error instanceof Error ? error.message : 'خطای ناشناخته'}`);
    }
};

/**
 * ذخیره متن OCR شده از PDF در localStorage
 */
export const saveOcrTextToStorage = async (resourceId: string, ocrText: string): Promise<void> => {
    try {
        localStorage.setItem(`pdf_ocr_${resourceId}`, ocrText);
        console.log(`OCR text saved for resource ${resourceId}`);
    } catch (error) {
        console.error('Error saving OCR text to localStorage:', error);
        throw new Error(`خطا در ذخیره متن OCR: ${error instanceof Error ? error.message : 'خطای ناشناخته'}`);
    }
};

/**
 * بازیابی متن OCR شده از localStorage
 */
export const getOcrTextFromStorage = (resourceId: string): string | null => {
    try {
        return localStorage.getItem(`pdf_ocr_${resourceId}`);
    } catch (error) {
        console.error('Error retrieving OCR text from localStorage:', error);
        return null;
    }
};

export default {
    generateMermaidCode,
    mermaidToReactflow,
    identifyImportantText,
    extractTextFromImage,
    extractTextFromPdfWithOCR,
    saveOcrTextToStorage,
    getOcrTextFromStorage
};