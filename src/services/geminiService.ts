import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from "@google/generative-ai";

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
const GEMINI_API_KEY: string = "AIzaSyD4_v-Qvhix5_6lmm74DL3jFrsPnimsIbc";
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
            model: "gemini-2.0-pro-exp-02-05",
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
 * استخراج متن از تصویر
 */
export const extractTextFromImage = async (imageFile: File): Promise<string> => {
    try {
        const formData: FormData = new FormData();
        formData.append('image', imageFile);
        
        const response: Response = await fetch('http://localhost:5000/api/extract-text', {
            method: 'POST',
            body: formData,
        });
        
        if (!response.ok) {
            throw new Error('خطا در استخراج متن از تصویر');
        }
        
        const data: { text: string } = await response.json();
        return data.text;
        
    } catch (error) {
        console.error('Error in extractTextFromImage:', error);
        throw new Error(`خطا در استخراج متن از تصویر: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}; 