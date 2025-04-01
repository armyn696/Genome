import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

// تنظیم Gemini API
const GEMINI_API_KEY: string = "AIzaSyAwzz-_Xf6XJYGbmC9Se_KxJD6h7LDIw2g";
const genAI: GoogleGenerativeAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// تنظیم timeout برای درخواست‌های Gemini (30 ثانیه)
const API_TIMEOUT_MS = 30000;

/**
 * تابع کمکی برای اجرای عملیات با timeout
 */
const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
    })
  ]);
};

/**
 * ارسال درخواست هایلایت به Gemini API
 * @param pageText متن صفحه برای هایلایت
 * @param userQuery پرامپت کاربر (مثلاً "نکات مهم را هایلایت کن")
 * @returns لیستی از عبارات که باید هایلایت شوند
 */
export const getHighlightsFromAI = async (pageText: string, userQuery: string): Promise<{text: string, type: string}[]> => {
  try {
    console.log('Requesting highlights from Gemini API...');
    
    // ایجاد مدل Gemini
    const model: GenerativeModel = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    // آماده‌سازی متن برای ارسال به مدل
    const normalizedText = pageText.replace(/\s+/g, " ").trim();

    // تست مدل Gemini با یک درخواست ساده
    try {
      console.log('Testing Gemini API with simple request...');
      const testPrompt = "Hello, please reply with the text: TEST_SUCCESS";
      const testResult = await withTimeout(
        model.generateContent(testPrompt),
        10000, // 10 ثانیه برای تست
        'زمان پاسخگویی تست Gemini API به پایان رسید.'
      );
      const testResponse = testResult.response.text();
      console.log('Gemini Test Response:', testResponse);
      if (!testResponse.includes('TEST_SUCCESS')) {
        console.warn('Gemini test did not return expected response');
      }
    } catch (testError) {
      console.error('Gemini API test failed:', testError);
      return [{ text: `خطا در تست اتصال به Gemini API: ${testError instanceof Error ? testError.message : 'خطای ناشناخته'}`, type: "key" }];
    }

    // ساخت پرامپت بهبود یافته برای Gemini
    const promptData = {
      task: "highlight_extraction_with_categories",
      user_request: userQuery,
      page_content: normalizedText,
      domain: "متن عمومی",
    };

    const prompt = `
[ROLE] شما یک متخصص استخراج و طبقه‌بندی مفاهیم کلیدی در متون هستید.

[TASK] متن زیر را تحلیل کرده و عبارات مهم را در سه دسته‌بندی استخراج کنید:

متن: """
${normalizedText}
"""

نوع درخواست: ${userQuery}

[CATEGORIES FOR CLASSIFICATION]
لطفاً هر عبارت را در یکی از این سه دسته طبقه‌بندی کنید:

1. "key": قیدها و نکات کلیدی (با رنگ قرمز نمایش داده می‌شوند)
   - شامل: قیدهای مهم، تعاریف اصلی، فرمول‌های کلیدی، اصطلاحات تخصصی
   - مثال: "همیشه"، "به طور کامل"، "دقیقاً"، "مهم‌ترین"، "اساسی"، "ضروری"

2. "main": ایده‌های اصلی و مفاهیم مرکزی (با رنگ زرد نمایش داده می‌شوند)
   - شامل: موضوعات اصلی، مفاهیم پایه، علل و معلول‌های مهم، موضوعات محوری
   - مثال: "نیروی گرانش"، "سیستم آموزشی"، "ساختار اقتصادی"

3. "detail": مثال‌ها، جزئیات و نکات تکمیلی (با رنگ سبز نمایش داده می‌شوند)
   - شامل: مثال‌ها، توضیحات بیشتر، نکات جانبی، موارد خاص و استثناها
   - مثال: "به عنوان مثال"، "به طور خاص"، "در موارد نادر"، "گاهی اوقات"

[IMPORTANT INSTRUCTIONS]
1. دقیقاً همان عبارات موجود در متن را استخراج کنید (copy-paste) بدون تغییر
2. برای هر عبارت، دسته مناسب را با توجه به محتوا و اهمیت آن انتخاب کنید
3. اصطلاحات تخصصی معمولاً در دسته "key" قرار می‌گیرند
4. موضوعات و مفاهیم اصلی در دسته "main" قرار می‌گیرند
5. توضیحات تکمیلی و مثال‌ها در دسته "detail" قرار می‌گیرند
6. خروجی فقط باید آرایه JSON با فرمت مشخص شده باشد
7. توجه ویژه به علامت دو نقطه (:) داشته باشید و آن را در عبارات به درستی حفظ کنید
8. هنگام استخراج عبارات، نشانه‌گذاری‌ها (مانند : ؛ ، . ! ؟) را به درستی حفظ کنید
9. فقط عبارات مهم و کلیدی را استخراج کنید، نه تمام متن را

[OUTPUT FORMAT]
فقط یک آرایه JSON با این ساختار برگردانید. بدون هیچ توضیح اضافی:
[
  {"text": "عبارت اول", "type": "key"},
  {"text": "عبارت دوم", "type": "main"},
  {"text": "عبارت سوم", "type": "detail"},
  ...
]
`;

    // ارسال درخواست به Gemini با timeout
    try {
      console.log('Sending highlight request to Gemini API...');
      const result = await withTimeout(
        model.generateContent(prompt),
        API_TIMEOUT_MS,
        'زمان پاسخگویی Gemini API به پایان رسید. لطفاً مجدداً تلاش کنید.'
      );
      
      const responseText = result.response.text();
      console.log('Raw response from Gemini:', responseText);
      
      // بررسی کنید که پاسخ خالی نباشد
      if (!responseText || responseText.trim() === '') {
        console.error('Received empty response from Gemini API');
        
        // تلاش مجدد با پرامپت ساده‌تر
        try {
          console.log('Retrying with simpler prompt...');
          // تنظیم متن کوتاه‌تر برای کاهش پیچیدگی
          const shorterText = normalizedText.length > 1500 ? normalizedText.substring(0, 1500) + "..." : normalizedText;
          
          const simplifiedPrompt = `
لطفاً عبارات مهم زیر را استخراج کنید و در قالب JSON برگردانید:

متن: """
${shorterText}
"""

درخواست: ${userQuery}

فقط آرایه JSON با این فرمت برگردانید:
[
  {"text": "عبارت اول", "type": "key"},
  {"text": "عبارت دوم", "type": "main"},
  {"text": "عبارت سوم", "type": "detail"}
]
`;
          
          const retryResult = await withTimeout(
            model.generateContent(simplifiedPrompt),
            API_TIMEOUT_MS,
            'زمان پاسخگویی Gemini API در تلاش مجدد به پایان رسید.'
          );
          
          const retryResponse = retryResult.response.text();
          console.log('Retry response from Gemini:', retryResponse);
          
          if (retryResponse && retryResponse.trim() !== '') {
            // استفاده از پاسخ تلاش مجدد
            try {
              // تمیزکردن پاسخ و پیدا کردن آرایه JSON
              const jsonMatch = retryResponse.match(/\[\s*{[\s\S]*}\s*\]/);
              if (jsonMatch) {
                const jsonArray = JSON.parse(jsonMatch[0]);
                // استخراج و بررسی آیتم‌های معتبر
                const validItems = jsonArray.filter((item: any) => 
                  item && 
                  typeof item.text === 'string' && 
                  item.text.trim().length > 0 &&
                  typeof item.type === 'string'
                );
                
                if (validItems.length > 0) {
                  console.log('Successfully extracted highlights from retry response');
                  return validItems;
                }
              }
            } catch (retryParseError) {
              console.error('Error parsing retry response:', retryParseError);
            }
          }
        } catch (retryError) {
          console.error('API retry failed:', retryError);
        }
        
        // اگر همه راه‌ها شکست خورد، حداقل چند هایلایت ساده برگردان
        return createFallbackHighlights(normalizedText);
      }
      
      // استخراج آرایه JSON از پاسخ با محافظت بیشتر
      try {
        // حذف کاراکترهای اضافی و پیدا کردن JSON
        const cleanedResponse = responseText
          .replace(/^```json\s*|\s*```$/g, '') // حذف بلوک کد
          .trim();
        
        console.log('Cleaned response:', cleanedResponse);
          
        // بررسی مجدد پس از تمیز کردن
        if (!cleanedResponse || cleanedResponse.trim() === '') {
          console.error('Cleaned response is empty');
          return [{ text: "خطا: پاسخ پردازش شده خالی است", type: "key" }];
        }
        
        // اگر پاسخ به شکل آرایه JSON است
        if (cleanedResponse.startsWith('[') && cleanedResponse.endsWith(']')) {
          try {
            const jsonResponse = JSON.parse(cleanedResponse);
            if (Array.isArray(jsonResponse)) {
              // حذف آیتم‌های تکراری و نامعتبر
              const validItems = jsonResponse.filter(item => 
                item && 
                typeof item.text === 'string' && 
                item.text.trim().length > 0 &&
                typeof item.type === 'string' &&
                ['key', 'main', 'detail'].includes(item.type)
              );
              
              // بررسی آیا آیتم معتبری وجود دارد
              if (validItems.length > 0) {
                // حذف آیتم‌های تکراری با متن مشابه
                const uniqueItems: {text: string, type: string}[] = [];
                const seenTexts = new Set<string>();
                
                for (const item of validItems) {
                  if (!seenTexts.has(item.text)) {
                    seenTexts.add(item.text);
                    uniqueItems.push(item);
                  }
                }
                
                return uniqueItems;
              } else {
                console.warn('No valid items found in JSON response');
              }
            }
          } catch (parseError) {
            console.error('Error parsing JSON response:', parseError, 'Response was:', cleanedResponse);
          }
        }
        
        // اگر به شکل آرایه JSON نباشد، سعی کنیم الگوی JSON را پیدا کنیم
        const jsonMatch = cleanedResponse.match(/\[\s*{.+}\s*(?:,\s*{.+}\s*)*\]/s);
        if (jsonMatch) {
          try {
            const jsonArray = JSON.parse(jsonMatch[0]);
            // فیلتر کردن و اطمینان از داشتن فیلدهای مورد نیاز
            const validItems = jsonArray.filter((item: any) => 
              item && 
              typeof item.text === 'string' && 
              item.text.trim().length > 0 &&
              typeof item.type === 'string'
            );
            
            if (validItems.length > 0) {
              return validItems;
            }
          } catch (matchError) {
            console.error('Error parsing matched JSON pattern:', matchError);
          }
        }
        
        // اگر همه تلاش‌ها شکست خورد، بازگشت به عنوان پیش‌فرض با یک موضوع ساده
        return [{ text: "هیچ موردی برای هایلایت پیدا نشد.", type: "key" }];
        
      } catch (error) {
        console.error('Error extracting highlights from response:', error);
        return [{ text: `خطا در استخراج هایلایت‌ها: ${error instanceof Error ? error.message : 'خطای ناشناخته'}`, type: "key" }];
      }
    } catch (apiError) {
      console.error('API call to Gemini failed:', apiError);
      return [{ text: `خطا در ارتباط با Gemini API: ${apiError instanceof Error ? apiError.message : 'خطای ناشناخته'}`, type: "key" }];
    }
  } catch (error) {
    console.error('Error getting highlights from AI:', error);
    return [{ text: `خطا در فرآیند دریافت هایلایت‌ها: ${error instanceof Error ? error.message : 'خطای ناشناخته'}`, type: "key" }];
  }
};

/**
 * تشخیص آیا یک درخواست مربوط به هایلایت کردن متن است
 * @param text متن درخواست کاربر
 * @returns اگر درخواست هایلایت باشد true برمی‌گرداند
 */
export const isHighlightRequest = (text: string): { isHighlight: boolean, pageNumber: number | null } => {
  // الگوهای مختلف برای درخواست‌های هایلایت
  const highlightPatterns = [
    /هایلایت/i,
    /highlight/i,
    /مشخص کن/i,
    /پررنگ کن/i,
    /نشان (بده|دهید)/i,
    /استخراج کن/i,
    /extract/i,
    /mark/i
  ];
  
  // بررسی وجود الگوهای هایلایت در متن
  const isHighlight = highlightPatterns.some(pattern => pattern.test(text));
  
  // استخراج شماره صفحه - با پشتیبانی از الگوهای بیشتر
  let pageNumber: number | null = null;
  
  // الگوهای مختلف برای استخراج شماره صفحه
  const pagePatterns = [
    /(?:صفحه|page)\s+(\d+)/i,  // صفحه 5، page 5
    /(?:صفحه|page)\s*(\d+)/i,  // صفحه5 (بدون فاصله)
    /(?:ص|p)\.?\s*(\d+)/i,     // ص 5، p.5، p5
    /(?:ص|p)\s*\.?\s*(\d+)/i,  // ص. 5، p . 5
    /(?:صفحه‌ی|صفحه ی)\s*(\d+)/i // صفحه‌ی 5
  ];
  
  for (const pattern of pagePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      pageNumber = parseInt(match[1], 10);
      console.log(`Found page number ${pageNumber} using pattern: ${pattern}`);
      break;
    }
  }
  
  // اگر با الگوهای بالا شماره صفحه پیدا نشد، فقط اعداد موجود در متن را بررسی کنیم
  if (!pageNumber && isHighlight) {
    // اگر فقط یک عدد در متن باشد، احتمالاً شماره صفحه است
    const numberMatches = text.match(/\d+/g);
    if (numberMatches && numberMatches.length === 1) {
      pageNumber = parseInt(numberMatches[0], 10);
      console.log(`Found page number ${pageNumber} from single number in request`);
    }
  }
  
  return { isHighlight, pageNumber };
};

/**
 * ساخت ActionCard برای درخواست هایلایت
 */
export const createHighlightAction = (text: string): { command: string } => {
  return {
    command: `هایلایت: ${text}`
  };
};

// اگر همه راه‌ها شکست خورد، حداقل چند هایلایت ساده برگردان
const createFallbackHighlights = (text: string) => {
  // تلاش برای استخراج برخی عبارات مهم از متن با روش‌های ساده
  const sentences = text.split(/[.!?؟،,]\s+/).filter(s => s.trim().length > 0);
  
  // انتخاب چند جمله اول به عنوان هایلایت‌های پیش‌فرض
  const fallbacks: {text: string, type: string}[] = [];
  
  // جمله اول به عنوان موضوع اصلی
  if (sentences.length > 0) {
    const firstSentence = sentences[0].trim();
    if (firstSentence.length > 5 && firstSentence.length < 150) {
      fallbacks.push({ text: firstSentence, type: "main" });
    }
  }
  
  // یافتن عبارات که شامل کلمات کلیدی هستند
  const keywordPatterns = [
    /مهم(?:ترین)?/, /(?:اصلی|کلیدی)/, /باید/, /نکته/, /توجه/,
    /همیشه/, /هرگز/, /ضروری/, /لازم/, /باید/, /قطعا/
  ];
  
  // بررسی متن برای یافتن عبارات شامل کلمات کلیدی
  for (const sentence of sentences) {
    if (fallbacks.length >= 5) break; // حداکثر 5 هایلایت
    
    for (const pattern of keywordPatterns) {
      if (pattern.test(sentence) && sentence.length < 200) {
        fallbacks.push({ text: sentence.trim(), type: "key" });
        break;
      }
    }
  }
  
  // افزودن برخی جملات به عنوان جزئیات
  for (let i = 1; i < Math.min(sentences.length, 5); i++) {
    if (fallbacks.length >= 5) break;
    
    const sentence = sentences[i].trim();
    if (sentence.length > 10 && sentence.length < 200 && 
        !fallbacks.some(item => item.text === sentence)) {
      fallbacks.push({ text: sentence, type: "detail" });
    }
  }
  
  // اگر هیچ هایلایتی پیدا نشد، هایلایت‌های پیش‌فرض برگردان
  if (fallbacks.length === 0) {
    return [
      { text: "متن مهم صفحه", type: "key" },
      { text: "موضوع اصلی", type: "main" },
      { text: "اطلاعات تکمیلی", type: "detail" }
    ];
  }
  
  return fallbacks;
}; 