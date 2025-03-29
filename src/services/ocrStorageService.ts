import { supabase } from '@/lib/supabase';

/**
 * ذخیره متن OCR یک PDF در Supabase
 * @param resourceId شناسه منبع PDF
 * @param ocrText متن استخراج شده از OCR
 */
export const saveOcrTextToSupabase = async (resourceId: string, ocrText: string): Promise<void> => {
  try {
    // بررسی وجود رکورد قبلی
    const { data: existingData, error: fetchError } = await supabase
      .from('ocr_texts')
      .select('*')
      .eq('resource_id', resourceId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // خطایی به جز "no rows found" رخ داده است
      console.error('Error checking existing OCR text:', fetchError);
      throw new Error(`خطا در بررسی OCR موجود: ${fetchError.message}`);
    }

    if (existingData) {
      // بروزرسانی رکورد موجود
      const { error: updateError } = await supabase
        .from('ocr_texts')
        .update({ 
          text: ocrText,
          updated_at: new Date().toISOString()
        })
        .eq('resource_id', resourceId);

      if (updateError) {
        console.error('Error updating OCR text:', updateError);
        throw new Error(`خطا در بروزرسانی OCR: ${updateError.message}`);
      }
    } else {
      // ایجاد رکورد جدید
      const { error: insertError } = await supabase
        .from('ocr_texts')
        .insert([
          { 
            resource_id: resourceId, 
            text: ocrText,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);

      if (insertError) {
        console.error('Error inserting OCR text:', insertError);
        throw new Error(`خطا در ذخیره OCR: ${insertError.message}`);
      }
    }

    // ذخیره یک نسخه در localStorage به عنوان کش
    localStorage.setItem(`ocr_text_${resourceId}`, ocrText);
    console.log(`OCR text for resource ${resourceId} saved to Supabase and localStorage cache`);
  } catch (error) {
    console.error('Error in saveOcrTextToSupabase:', error);
    // در صورت خطا، متن را حداقل در localStorage ذخیره کنیم
    localStorage.setItem(`ocr_text_${resourceId}`, ocrText);
    throw error;
  }
};

/**
 * بازیابی متن OCR یک PDF از Supabase
 * @param resourceId شناسه منبع PDF
 * @returns متن OCR شده یا null در صورت عدم وجود
 */
export const getOcrTextFromSupabase = async (resourceId: string): Promise<string | null> => {
  try {
    // ابتدا بررسی کش localStorage
    const cachedText = localStorage.getItem(`ocr_text_${resourceId}`);
    
    // دریافت از Supabase
    const { data, error } = await supabase
      .from('ocr_texts')
      .select('text')
      .eq('resource_id', resourceId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // رکوردی یافت نشد
        console.log(`No OCR text found in Supabase for resource ${resourceId}`);
        return cachedText; // برگرداندن نسخه کش شده یا null
      }
      
      console.error('Error fetching OCR text from Supabase:', error);
      
      // در صورت خطای دسترسی به Supabase، از کش استفاده کنیم
      if (cachedText) {
        console.log(`Using cached OCR text for resource ${resourceId}`);
        return cachedText;
      }
      
      throw new Error(`خطا در بازیابی OCR از Supabase: ${error.message}`);
    }

    if (data && data.text) {
      // بروزرسانی کش
      localStorage.setItem(`ocr_text_${resourceId}`, data.text);
      return data.text;
    }

    return cachedText; // برگرداندن نسخه کش شده یا null اگر در Supabase نیز وجود نداشت
  } catch (error) {
    console.error('Error in getOcrTextFromSupabase:', error);
    
    // در صورت خطا، از کش استفاده کنیم
    const cachedText = localStorage.getItem(`ocr_text_${resourceId}`);
    if (cachedText) {
      console.log(`Using cached OCR text for resource ${resourceId} due to error`);
      return cachedText;
    }
    
    return null;
  }
};

/**
 * به‌روزرسانی متن OCR یک صفحه خاص در Supabase
 * @param resourceId شناسه منبع PDF
 * @param pageIndex شماره صفحه (شروع از 1)
 * @param newPageText متن جدید برای صفحه
 */
export const updatePageTextInSupabase = async (resourceId: string, pageIndex: number, newPageText: string): Promise<boolean> => {
  try {
    // ابتدا متن OCR فعلی را دریافت می‌کنیم
    const currentOcrText = await getOcrTextFromSupabase(resourceId);
    if (!currentOcrText) {
      console.error('No OCR text found to update');
      return false;
    }

    // متن را به صفحات تقسیم می‌کنیم
    const pageTexts = currentOcrText.split(/===== صفحه \d+ =====/).filter(page => page.trim());
    
    // اگر شماره صفحه نامعتبر باشد
    if (pageIndex < 1 || pageIndex > pageTexts.length) {
      console.error(`Invalid page index: ${pageIndex}. Total pages: ${pageTexts.length}`);
      return false;
    }

    // صفحه مورد نظر را آپدیت می‌کنیم
    pageTexts[pageIndex - 1] = newPageText;

    // متن کامل را دوباره می‌سازیم
    let updatedFullText = "";
    for (let i = 0; i < pageTexts.length; i++) {
      updatedFullText += `===== صفحه ${i + 1} =====\n${pageTexts[i]}\n`;
    }

    // متن به‌روزرسانی شده را در Supabase ذخیره می‌کنیم
    const { error: updateError } = await supabase
      .from('ocr_texts')
      .update({ 
        text: updatedFullText,
        updated_at: new Date().toISOString()
      })
      .eq('resource_id', resourceId);

    if (updateError) {
      console.error('Error updating OCR text in Supabase:', updateError);
      return false;
    }

    // کش محلی را هم به‌روزرسانی می‌کنیم
    localStorage.setItem(`ocr_text_${resourceId}`, updatedFullText);
    console.log(`Updated page ${pageIndex} for resource ${resourceId} in Supabase`);
    return true;
  } catch (error) {
    console.error('Error in updatePageTextInSupabase:', error);
    return false;
  }
};
