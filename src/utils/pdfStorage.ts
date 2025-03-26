import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { openDB } from 'idb';

const DB_NAME = 'PDFStorage';
const STORE_NAME = 'pdf_pages';
const PDF_FILE_STORE = 'pdf_file';

const initDB = async () => {
 return openDB(DB_NAME, 1, {
   upgrade(db) {
     if (!db.objectStoreNames.contains(STORE_NAME)) {
       db.createObjectStore(STORE_NAME);
     }
     if (!db.objectStoreNames.contains(PDF_FILE_STORE)) {
       db.createObjectStore(PDF_FILE_STORE);
     }
   },
 });
};

const createStorageFileName = (fileId: string, originalName: string) => `${fileId}-${originalName}`;

export const storePdf = async (file: File): Promise<{ id: string, url: string, displayName: string }> => {
  try {
    const fileId = crypto.randomUUID();
    
    // نام فایل برای ذخیره در Supabase با فرمت uuid-filename
    const storageFileName = `${fileId}-${file.name}`;
    
    // لاگ برای دیباگ
    console.log('Original file name:', file.name);
    console.log('Storage file name:', storageFileName);
    
    // آپلود فایل در استوریج
    const { data: storageData, error: storageError } = await supabase.storage
      .from('pdfs')
      .upload(storageFileName, file, {
        cacheControl: '3600',
        upsert: true
      });
      
    if (storageError) {
      console.error('Storage error:', storageError);
      throw storageError;
    }

    console.log('File uploaded to storage successfully');

    // ذخیره اطلاعات در جدول files
    const fileInfo = {
      id: fileId,
      original_name: file.name,
      storage_path: storageFileName,
      bucket_id: 'pdfs',
      size: file.size.toString()
    };

    console.log('Inserting into database:', fileInfo);
    const { data: fileData, error: dbError } = await supabase
      .from('files')
      .insert(fileInfo)
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // حذف فایل از استوریج در صورت خطا
      await supabase.storage
        .from('pdfs')
        .remove([storageFileName]);
      throw dbError;
    }

    console.log('File info inserted into database successfully');
    
    const { data: { publicUrl } } = supabase.storage
      .from('pdfs')
      .getPublicUrl(storageFileName);

    return {
      id: fileId,
      url: publicUrl,
      displayName: file.name
    };
  } catch (error) {
    console.error('Error storing PDF:', error);
    toast.error("خطا در ذخیره فایل. لطفا دوباره تلاش کنید.");
    throw error;
  }
};

export const retrievePdf = async (fileId: string, displayName: string): Promise<string | null> => {
  try {
    // اگر displayName خالی است، ابتدا باید از دیتابیس اطلاعات فایل را بخوانیم
    if (!displayName) {
      console.log('Display name is empty, fetching file info from database');
      const { data: fileData, error } = await supabase
        .from('files')
        .select('original_name, storage_path')
        .eq('id', fileId)
        .single();
      
      if (error) {
        console.error('Error fetching file info:', error);
        throw error;
      }
      
      if (fileData && fileData.storage_path) {
        console.log('Retrieved storage path from DB:', fileData.storage_path);
        const { data: { publicUrl } } = supabase.storage
          .from('pdfs')
          .getPublicUrl(fileData.storage_path);
        
        return publicUrl;
      } else {
        throw new Error('File not found in database');
      }
    }
    
    // اگر displayName وجود داشت از روش قبلی استفاده می‌کنیم
    const storageFileName = createStorageFileName(fileId, displayName);
    console.log('Retrieving PDF with storage file name:', storageFileName);
    
    const { data: { publicUrl } } = supabase.storage
      .from('pdfs')
      .getPublicUrl(storageFileName);
      
    return publicUrl;
  } catch (error) {
    console.error('Error retrieving PDF:', error);
    toast.error("خطا در بازیابی فایل. لطفا دوباره تلاش کنید.");
    return null;
  }
};

export const clearPdf = async (fileId: string, displayName: string) => {
 try {
   const storageFileName = createStorageFileName(fileId, displayName);
   const { error } = await supabase.storage
     .from('pdfs')
     .remove([storageFileName]);
   if (error) throw error;
   console.log('PDF cleared successfully:', storageFileName);
 } catch (error) {
   console.error('Error clearing PDF:', error);
   throw error;
 }
};