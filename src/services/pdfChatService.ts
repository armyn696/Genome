import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from "@google/generative-ai";
import * as pdfjsLib from 'pdfjs-dist';
import { configurePdfJs, setPdfOptions } from '@/utils/pdfConfig';
import { getOcrTextFromSupabase } from '@/services/ocrStorageService';

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
export const generatePdfResponse = async (pdfText: string, userQuestion: string, imageData?: string, resourceId?: string): Promise<string> => {
  try {
    // سعی در استخراج متن OCR شده اگر resourceId مشخص شده باشد
    let textToUse = pdfText;
    
    if (resourceId) {
      console.log('Attempting to use OCR text for response generation');
      const ocrText = await getOcrTextFromSupabase(resourceId);
      if (ocrText) {
        console.log('Using OCR text for response generation');
        textToUse = ocrText;
      } else {
        console.log('No OCR text found, falling back to PDF extracted text');
      }
    }
    
    // ساخت پرامپت براساس سوال کاربر و متن PDF
    const prompt = `
متن زیر از یک PDF استخراج شده است. لطفاً به سؤال کاربر با توجه به این متن پاسخ دهید.
اگر پاسخ سؤال در متن وجود ندارد، صادقانه بگویید "نمی‌توانم پاسخ این سؤال را در سند پیدا کنم".
لطفاً فقط از اطلاعات موجود در متن استفاده کنید و اطلاعات خارجی اضافه نکنید.

متن PDF:
${textToUse}

سؤال کاربر: ${userQuestion}

پاسخ به کاربر با توجه به متن PDF:
`;

    // انتخاب مدل مناسب براساس اینکه آیا تصویر داریم یا خیر
    let response;
    
    if (imageData) {
      // استفاده از مدل vision
      const visionModel = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2000,
        }
      });
      
      const imageParts = [{
        inlineData: {
          data: imageData.split(",")[1],
          mimeType: "image/jpeg"
        }
      }];
      
      response = await visionModel.generateContent([prompt, ...imageParts]);
    } else {
      // استفاده از مدل متنی استاندارد
      const textModel = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2000,
        }
      });
      
      response = await textModel.generateContent(prompt);
    }
    
    const result = response.response.text();
    return result;
  } catch (error) {
    console.error("Error generating response:", error);
    throw new Error(`خطا در تولید پاسخ: ${error instanceof Error ? error.message : 'خطای ناشناخته'}`);
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
