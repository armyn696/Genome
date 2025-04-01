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

/**
 * تعریف نوع دیتای هایلایت
 */
export type Highlight = {
  text: string;
  type: string;
};

/**
 * تعریف نوع دیتای نقشه هایلایت‌ها
 */
export type HighlightsMap = {
  [page: number]: Highlight[];
};

/**
 * ذخیره هایلایت‌ها در Supabase
 * @param resourceId شناسه منبع PDF
 * @param highlights نقشه هایلایت‌ها با کلید شماره صفحه
 */
export const saveHighlightsToSupabase = async (resourceId: string, highlights: HighlightsMap): Promise<boolean> => {
  try {
    // تبدیل آبجکت هایلایت‌ها به رشته JSON برای ذخیره
    const highlightsJSON = JSON.stringify(highlights);
    
    // بررسی وجود رکورد قبلی در جدول highlights
    const { data: existingData, error: fetchError } = await supabase
      .from('highlights')
      .select('*')
      .eq('resource_id', resourceId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // خطایی به جز "no rows found" رخ داده است
      console.error('Error checking existing highlights:', fetchError);
      throw new Error(`خطا در بررسی هایلایت‌های موجود: ${fetchError.message}`);
    }

    if (existingData) {
      // بروزرسانی رکورد موجود
      const { error: updateError } = await supabase
        .from('highlights')
        .update({ 
          data: highlightsJSON,
          updated_at: new Date().toISOString()
        })
        .eq('resource_id', resourceId);

      if (updateError) {
        console.error('Error updating highlights:', updateError);
        throw new Error(`خطا در بروزرسانی هایلایت‌ها: ${updateError.message}`);
      }
    } else {
      // ایجاد رکورد جدید
      const { error: insertError } = await supabase
        .from('highlights')
        .insert([
          { 
            resource_id: resourceId, 
            data: highlightsJSON,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);

      if (insertError) {
        console.error('Error inserting highlights:', insertError);
        throw new Error(`خطا در ذخیره هایلایت‌ها: ${insertError.message}`);
      }
    }

    // ذخیره یک نسخه در localStorage به عنوان کش
    localStorage.setItem(`highlights_${resourceId}`, highlightsJSON);
    console.log(`Highlights for resource ${resourceId} saved to Supabase and localStorage cache`);
    return true;
  } catch (error) {
    console.error('Error in saveHighlightsToSupabase:', error);
    // در صورت خطا، هایلایت‌ها را حداقل در localStorage ذخیره کنیم
    try {
      localStorage.setItem(`highlights_${resourceId}`, JSON.stringify(highlights));
    } catch (localStorageError) {
      console.error('Failed to save highlights to localStorage:', localStorageError);
    }
    return false;
  }
};

/**
 * بازیابی هایلایت‌ها از Supabase
 * @param resourceId شناسه منبع PDF
 * @returns نقشه هایلایت‌ها یا آبجکت خالی در صورت عدم وجود
 */
export const getHighlightsFromSupabase = async (resourceId: string): Promise<HighlightsMap> => {
  try {
    // ابتدا بررسی کش localStorage
    const cachedHighlights = localStorage.getItem(`highlights_${resourceId}`);
    let cachedData: HighlightsMap | null = null;
    
    if (cachedHighlights) {
      try {
        cachedData = JSON.parse(cachedHighlights);
      } catch (parseError) {
        console.error('Error parsing cached highlights:', parseError);
      }
    }
    
    // دریافت از Supabase
    const { data, error } = await supabase
      .from('highlights')
      .select('data')
      .eq('resource_id', resourceId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // رکوردی یافت نشد
        console.log(`No highlights found in Supabase for resource ${resourceId}`);
        return cachedData || {}; // برگرداندن نسخه کش شده یا آبجکت خالی
      }
      
      console.error('Error fetching highlights from Supabase:', error);
      
      // در صورت خطای دسترسی به Supabase، از کش استفاده کنیم
      if (cachedData) {
        console.log(`Using cached highlights for resource ${resourceId}`);
        return cachedData;
      }
      
      return {}; // در صورت خطا، آبجکت خالی برگردانیم
    }

    if (data && data.data) {
      try {
        const parsedData = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
        // بروزرسانی کش
        localStorage.setItem(`highlights_${resourceId}`, JSON.stringify(parsedData));
        return parsedData;
      } catch (parseError) {
        console.error('Error parsing highlights from Supabase:', parseError);
        return cachedData || {};
      }
    }

    return cachedData || {}; // برگرداندن نسخه کش شده یا آبجکت خالی
  } catch (error) {
    console.error('Error in getHighlightsFromSupabase:', error);
    
    // در صورت خطا، از کش استفاده کنیم
    try {
      const cachedHighlights = localStorage.getItem(`highlights_${resourceId}`);
      if (cachedHighlights) {
        return JSON.parse(cachedHighlights);
      }
    } catch (parseError) {
      console.error('Error parsing cached highlights:', parseError);
    }
    
    return {};
  }
};

/**
 * ایجاد جدول highlights در Supabase اگر وجود نداشته باشد
 * این تابع را می‌توان در ابتدای اجرای برنامه فراخوانی کرد
 */
export const ensureHighlightsTableExists = async (): Promise<boolean> => {
  try {
    // بررسی وجود جدول highlights
    const { error: queryError } = await supabase
      .from('highlights')
      .select('id')
      .limit(1);
    
    // اگر جدول وجود نداشته باشد
    if (queryError && queryError.code === 'PGRST116') {
      console.log('Highlights table does not exist. Creating it...');
      
      // دستور SQL برای ایجاد جدول
      const createTableSQL = `
      CREATE TABLE IF NOT EXISTS highlights (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        resource_id TEXT NOT NULL,
        data JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(resource_id)
      );
      
      -- Add indices for faster lookups
      CREATE INDEX IF NOT EXISTS idx_highlights_resource_id ON highlights(resource_id);
      
      -- Enable RLS (Row Level Security)
      ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;
      
      -- Create policies for access control
      CREATE POLICY "Public highlights access"
        ON highlights
        FOR ALL
        USING (true);
      `;
      
      // اجرای دستور SQL
      const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
      
      if (createError) {
        console.error('Failed to create highlights table:', createError);
        return false;
      }
      
      console.log('Highlights table created successfully');
      return true;
    }
    
    // جدول از قبل وجود دارد
    console.log('Highlights table already exists');
    return true;
  } catch (error) {
    console.error('Error checking/creating highlights table:', error);
    return false;
  }
};
