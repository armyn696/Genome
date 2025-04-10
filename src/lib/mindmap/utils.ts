import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = "AIzaSyAwzz-_Xf6XJYGbmC9Se_KxJD6h7LDIw2g";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export function cleanMermaidCode(responseText: string): string {
    // حذف بک‌تیک‌ها و کلمه mermaid
    let cleaned = responseText.replace(/```mermaid\s*|\s*```/g, '');
    
    // پردازش خط به خط
    const lines = cleaned.split('\n')
        .filter(line => line.trim())
        .map(line => {
            // حذف پرانتزهای تودرتو
            line = line.replace(/\((.*?)\((.*?)\)\)/, '($1 $2)');
            
            // حذف پرانتزهای اضافی داخل پرانتز اصلی
            while (line.includes('((') || line.includes('))')) {
                line = line.replace('((', '(').replace('))', ')');
            }
            
            // اطمینان از وجود فقط یک جفت پرانتز در هر بخش
            const parts = line.split('(');
            if (parts.length > 2) {
                const mainPart = parts[0];
                const contentParts = parts.slice(1).map(p => p.trim().replace(')', ''));
                line = `${mainPart}(${contentParts.join(' ')})`;
            }
            
            return line;
        });
    
    // اطمینان از شروع با mindmap
    let result = lines.join('\n');
    if (!result.trim().startsWith('mindmap')) {
        result = 'mindmap\n' + result;
    }
        
    return result;
}

export async function generateMermaidCode(inputText: string): Promise<string | null> {
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash",
            generationConfig: {
                temperature: 0.9,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 4096,
            }
        });

        const prompt = `
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
        ${inputText}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // برای دیباگ، پاسخ خام را چاپ کنیم
        console.log("Raw AI response:", text);
        console.log("Response length:", text.length);
        
        if (text) {
            const cleaned = cleanMermaidCode(text);
            console.log("Cleaned response:", cleaned);
            return cleaned;
        }
        throw new Error("پاسخی از API دریافت نشد.");

    } catch (e) {
        console.error("خطا در تولید کد Mermaid:", e);
        return null;
    }
}

export function mermaidToReactflow(mermaidCode: string) {
    const nodes: any[] = [];
    const edges: any[] = [];
    let nodeId = 0;
    const parentStack: number[] = [];
    
    // رنگ‌های مورد استفاده برای شاخه‌ها
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFD700', 
                   '#D4A5A5', '#9FA8DA', '#80DEEA', '#FFBB00', '#A5D6A7'];
    let colorIndex = 0;
    const branchColors: { [key: string]: string } = {};
    let currentBranch: string | null = null;
    
    const lines = mermaidCode.split('\n');
    const radiusStep = 200;
    const levelCount: { [key: number]: number } = {};
    const currentLevelNodes: { [key: number]: number } = {};
    const levelAngles: { [key: number]: number } = {};
    
    // اول شاخه‌های اصلی را پیدا و رنگ‌بندی می‌کنیم
    lines.forEach(line => {
        if (!line.trim()) return;
        const indent = line.length - line.trimLeft().length;
        if (indent === 4) {
            let text = line.trim();
            if (text.includes('(')) {
                text = text.substring(text.indexOf('(') + 1, text.indexOf(')'));
            } else if (text.includes('[')) {
                text = text.substring(text.indexOf('[') + 1, text.indexOf(']'));
            }
            branchColors[text] = colors[colorIndex % colors.length];
            colorIndex++;
        }
    });
    
    // شمارش تعداد نودها در هر سطح
    lines.forEach(line => {
        if (!line.trim()) return;
        const indent = line.length - line.trimLeft().length;
        const level = Math.floor(indent / 2);
        levelCount[level] = (levelCount[level] || 0) + 1;
    });
    
    lines.slice(1).forEach(line => {
        if (!line.trim()) return;
        
        const indent = line.length - line.trimLeft().length;
        const level = Math.floor(indent / 2);
        
        let text = line.trim();
        if (text.startsWith('root')) {
            text = text.match(/\((.*?)\)/)?.[1] || '';
        } else if (text.includes('(')) {
            text = text.match(/\((.*?)\)/)?.[1] || '';
        } else if (text.includes('[')) {
            text = text.match(/\[(.*?)\]/)?.[1] || '';
        }
        
        // تعیین رنگ نود
        let nodeColor = '#1a73e8';
        
        if (indent === 4) {
            currentBranch = text;
            if (text in branchColors) {
                nodeColor = branchColors[text];
            }
        } else if (currentBranch && currentBranch in branchColors) {
            nodeColor = branchColors[currentBranch];
        }
        
        if (!(level in currentLevelNodes)) {
            currentLevelNodes[level] = 0;
            levelAngles[level] = level > 0 ? -180 : 0;
        }
        currentLevelNodes[level]++;
        
        // محاسبه موقعیت با الگوی شعاعی
        let x = 0;
        let y = 0;
        
        if (level > 0) {
            const angleRange = level === 1 ? 360 : 180;
            const angleStep = angleRange / levelCount[level];
            const currentAngle = levelAngles[level] + (currentLevelNodes[level] - 1) * angleStep;
            
            let radius = level * radiusStep;
            if (level > 1) {
                radius *= 1.2;
            }
            
            x = radius * Math.cos(currentAngle * Math.PI / 180);
            y = radius * Math.sin(currentAngle * Math.PI / 180);
        }
        
        // ایجاد نود
        const node = {
            id: nodeId.toString(),
            type: 'default',
            position: { x, y },
            data: { label: text },
            style: {
                background: `${nodeColor}22`,
                border: `1px solid ${nodeColor}`,
                padding: 10,
                borderRadius: 15,
                minWidth: 120,
                fontSize: 12,
                textAlign: 'center',
                boxShadow: `0 2px 4px ${nodeColor}33`,
                color: nodeColor
            }
        };
        nodes.push(node);
        
        // ایجاد یال
        if (level > 0 && parentStack.length > 0) {
            try {
                while (parentStack.length >= level) {
                    parentStack.pop();
                }
                if (parentStack.length > 0) {
                    edges.push({
                        id: `e${parentStack[parentStack.length - 1]}-${nodeId}`,
                        source: parentStack[parentStack.length - 1].toString(),
                        target: nodeId.toString(),
                        type: 'default',
                        style: {
                            stroke: nodeColor,
                            strokeWidth: 1,
                            opacity: 0.5
                        }
                    });
                }
            } catch (e) {
                console.error(e);
            }
        }
        
        parentStack.push(nodeId);
        nodeId++;
    });
    
    // مرکزی کردن نمودار
    if (nodes.length > 0) {
        const minX = Math.min(...nodes.map(node => node.position.x));
        const maxX = Math.max(...nodes.map(node => node.position.x));
        const minY = Math.min(...nodes.map(node => node.position.y));
        const maxY = Math.max(...nodes.map(node => node.position.y));
        
        const centerX = (maxX + minX) / 2;
        const centerY = (maxY + minY) / 2;
        
        nodes.forEach(node => {
            node.position.x -= centerX;
            node.position.y -= centerY;
        });
    }
    
    return { nodes, edges };
}
