import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from "@google/generative-ai";
import * as pdfjsLib from 'pdfjs-dist';
import { configurePdfJs, setPdfOptions } from '@/utils/pdfConfig';

// تنظیم کانفیگ pdfjs
configurePdfJs();

// تنظیم Gemini API
const GEMINI_API_KEY: string = "AIzaSyD4_v-Qvhix5_6lmm74DL3jFrsPnimsIbc";
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
 */
export const generatePdfResponse = async (pdfText: string, userQuestion: string): Promise<string> => {
  try {
    console.log('Generating PDF response with Gemini');
    
    const generationConfig: GenerationConfig = {
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 2048,
    };
    
    // ایجاد مدل Gemini
    const model: GenerativeModel = genAI.getGenerativeModel({
      model: "gemini-2.0-pro-exp-02-05",
      generationConfig,
    });
    
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
      4. اطلاعات را به صورت ساختاریافته با عناوین، نقاط گلوله‌ای، و شماره‌گذاری در صورت نیاز ارائه بده.
      5. اگر اطلاعات مهمی در متن PDF وجود دارد، آن را در قالب بخش‌های مشخص با عناوین مناسب ارائه کن.
      6. اگر پاسخ سوال در متن PDF نیست، صادقانه بگو که نمی‌توانی با توجه به متن موجود به این سوال پاسخ دهی.
      7. از به هم ریختگی متن و ارائه پاسخ به صورت یک بلوک متنی بزرگ خودداری کن.
      8. اگر نقل قول مستقیم از متن PDF می‌کنی، آن را در فرمت مناسب و با علامت نقل قول نشان بده.
    `;
    
    // دریافت پاسخ از Gemini
    const result = await model.generateContent(prompt);
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
