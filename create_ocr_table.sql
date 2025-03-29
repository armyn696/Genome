-- ایجاد جدول برای ذخیره متن OCR
CREATE TABLE IF NOT EXISTS public.ocr_texts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id TEXT NOT NULL UNIQUE,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ایجاد ایندکس برای جستجوی سریع
CREATE INDEX IF NOT EXISTS ocr_texts_resource_id_idx ON public.ocr_texts (resource_id);

-- تنظیم سیاست‌های امنیتی
ALTER TABLE public.ocr_texts ENABLE ROW LEVEL SECURITY;

-- سیاست دسترسی به جدول - اجازه دسترسی برای همه کاربران
CREATE POLICY "All users can access OCR texts" ON public.ocr_texts
    FOR ALL
    USING (true)
    WITH CHECK (true);
