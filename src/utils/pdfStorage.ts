import { toast } from 'sonner';
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

export const storePdf = async (id: string, dataUrl: string) => {
  try {
    const db = await initDB();
    const tx = db.transaction(PDF_FILE_STORE, 'readwrite');
    const store = tx.objectStore(PDF_FILE_STORE);
    await store.put(dataUrl, id);
    await tx.done;
    console.log('PDF stored successfully with ID:', id);
  } catch (error) {
    console.error('Error storing PDF:', error);
    toast.error("Error storing PDF. Please try again.");
    throw error;
  }
};

export const retrievePdf = async (id: string): Promise<string | null> => {
  try {
    const db = await initDB();
    const tx = db.transaction(PDF_FILE_STORE, 'readonly');
    const store = tx.objectStore(PDF_FILE_STORE);
    const result = await store.get(id);
    await tx.done;
    return result || null;
  } catch (error) {
    console.error('Error retrieving PDF:', error);
    return null;
  }
};

export const clearPdf = async (id: string) => {
  try {
    const db = await initDB();
    const tx = db.transaction(PDF_FILE_STORE, 'readwrite');
    await tx.objectStore(PDF_FILE_STORE).delete(id);
    await tx.done;
  } catch (error) {
    console.error('Error clearing PDF:', error);
  }
};