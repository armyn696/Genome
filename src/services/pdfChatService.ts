import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from "@google/generative-ai";
import * as pdfjsLib from 'pdfjs-dist';
import { configurePdfJs, setPdfOptions } from '@/utils/pdfConfig';

// تنظیم کانفیگ pdfjs
configurePdfJs();

// تنظیم Gemini API
const GEMINI_API_KEY: string = "AIzaSyAwzz-_Xf6XJYGbmC9Se_KxJD6h7LDIw2g";
const genAI: GoogleGenerativeAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * استخراج متن از PDF با استفاده از URL
 */
export const extractTextFromPdf = async (pdfUrl: string): Promise<string> => {
  try {
    console.log('Extracting text from PDF:', pdfUrl);
    
    // دریافت سند PDF
    const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
    console.log(`PDF loaded with ${pdf.numPages} pages`);
    
    let fullText = '';
    
    // استخراج متن از تمام صفحات
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // استخراج متن از محتوای صفحه
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n\n';
      console.log(`Extracted text from page ${i}`);
    }
    
    console.log('PDF text extraction completed');
    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(`خطا در استخراج متن از PDF: ${error instanceof Error ? error.message : 'خطای ناشناخته'}`);
  }
};

/**
 * ارسال پرسش درباره محتوای PDF به Gemini و دریافت پاسخ
 * اگر عکسی نیز داده شده باشد، از قابلیت چندرسانه‌ای Gemini استفاده می‌کند
 */
export const generatePdfResponse = async (pdfText: string, userQuestion: string, imageData?: string): Promise<string> => {
  try {
    console.log('Generating PDF response with Gemini', imageData ? 'with image' : 'without image');
    
    const generationConfig: GenerationConfig = {
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 2048,
    };
    
    // ایجاد مدل Gemini
    const model: GenerativeModel = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      },
    });

    let result;
    
    // اگر تصویر داریم، از قابلیت چندرسانه‌ای استفاده می‌کنیم
    if (imageData) {
      console.log('Processing request with image');
      
      // تبدیل data URL به یک شیء محتوایی چندرسانه‌ای
      const imageUrl = imageData; // به شکل data:image/png;base64,...
      
      // پرامپت برای Gemini (ترکیب متن PDF و سوال کاربر)
      const prompt = `
        متن PDF زیر را در نظر بگیر، تصویر ارسال شده را بررسی کن و به پرسش کاربر پاسخ بده:
        
        ===== متن PDF =====
        ${pdfText.substring(0, 15000)} 
        ${pdfText.length > 15000 ? '...(متن ادامه دارد)' : ''}
        ===================
        
        پرسش: ${userQuestion}
        
        دستورالعمل‌ها:
        1. به تصویر ارسال شده نگاه کن و اگر مرتبط با سوال است، آن را در پاسخ خود در نظر بگیر.
        2. پاسخی جامع، دقیق و کامل با توجه به محتوای PDF و تصویر ارائه بده.
        3. پاسخ را با فرمت مناسب و پاراگراف‌بندی درست ارائه کن.
        4. از کاراکترهای ویژه مانند نقطه، ویرگول، نقطه ویرگول و علامت سوال به درستی استفاده کن.
      `;
      
      try {
        // تبدیل data URL به Blob
        const fetchResponse = await fetch(imageUrl);
        const blob = await fetchResponse.blob();
        
        // استخراج بخش base64 از data URL
        const base64Data = imageUrl.split(',')[1];
        
        // ایجاد درخواست با متن و تصویر
        result = await model.generateContent([
          { text: prompt },
          {
            inlineData: {
              mimeType: blob.type,
              data: base64Data
            }
          }
        ]);
      } catch (error) {
        console.error('Error processing image for Gemini:', error);
        throw new Error(`خطا در پردازش تصویر: ${error instanceof Error ? error.message : 'خطای ناشناخته'}`);
      }
    } else {
      // حالت متنی معمولی (بدون تصویر)
      // پرامپت برای Gemini (ترکیب متن PDF و سوال کاربر)
      const prompt: string = `
        متن PDF زیر را در نظر بگیر و به پرسش کاربر پاسخ بده:
        
        ===== متن PDF =====
        ${pdfText.substring(0, 15000)} 
        ${pdfText.length > 15000 ? '...(متن ادامه دارد)' : ''}
        ===================
        
        پرسش: ${userQuestion}
        
        دستورالعمل‌ها:
        1. پاسخی جامع، دقیق و کامل با توجه به محتوای PDF ارائه بده.
        2. پاسخ را با فرمت مناسب و پاراگراف‌بندی درست ارائه کن.
        3. از کاراکترهای ویژه مانند نقطه، ویرگول، نقطه ویرگول و علامت سوال به درستی استفاده کن.
      `;
      
      result = await model.generateContent(prompt);
    }
    
    const response = result.response;
    
    if (response && response.text()) {
      // پردازش و فرمت‌دهی پاسخ
      let formattedResponse = response.text()
        // اطمینان از اینکه پاراگراف‌ها به درستی جدا شده‌اند
        .replace(/\n\s*\n/g, '\n\n')
        // تبدیل شماره‌گذاری‌های ساده به فرمت بهتر
        .replace(/^(\d+)\.\s+/gm, '$1. ')
        // تبدیل موارد گلوله‌ای ساده به فرمت بهتر
        .replace(/^[-*]\s+/gm, '• ')
        // اطمینان از فاصله مناسب بعد از نقطه
        .replace(/\.([A-Za-zآ-ی])/g, '. $1')
        // اطمینان از فضای مناسب بین عنوان‌ها و محتوا
        .replace(/^(#+)\s*(.+)$/gm, '\n$1 $2\n');
      
      // اطمینان از اینکه پاسخ با پاراگراف خالی شروع نمی‌شود
      formattedResponse = formattedResponse.trim();
      
      return formattedResponse;
    } else {
      throw new Error("پاسخی از مدل دریافت نشد");
    }
  } catch (error) {
    console.error('Error generating PDF response with Gemini:', error);
    throw new Error(`خطا در پاسخگویی به سوال: ${error instanceof Error ? error.message : 'خطای ناشناخته'}`);
  }
};

// تابع کمکی برای ذخیره متن PDF در حافظه محلی برای عملکرد سریع‌تر
export const cachePdfText = async (resourceId: string, text: string): Promise<void> => {
  try {
    localStorage.setItem(`pdf_text_${resourceId}`, text);
  } catch (error) {
    console.error('Error caching PDF text:', error);
  }
};

// تابع کمکی برای بازیابی متن PDF از حافظه محلی
export const getCachedPdfText = (resourceId: string): string | null => {
  try {
    return localStorage.getItem(`pdf_text_${resourceId}`);
  } catch (error) {
    console.error('Error getting cached PDF text:', error);
    return null;
  }
};
