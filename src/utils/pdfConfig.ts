/**
 * تنظیمات مرکزی برای pdf.js
 * این فایل برای اطمینان از یکسان بودن تنظیمات worker در تمام برنامه استفاده می‌شود
 */

import * as pdfjsLib from 'pdfjs-dist';
import { pdfjs } from 'react-pdf';

// این تابع را در ابتدای برنامه فراخوانی کنید تا worker به درستی تنظیم شود
export const configurePdfJs = () => {
  // استفاده از CDN برای worker
  const workerUrl = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
  
  // تنظیم worker برای pdfjs از react-pdf
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  
  // تنظیم worker برای pdfjs-dist
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
  
  console.log(`PDF worker configured: ${workerUrl}`);
};

// تنظیم کلاس‌های مورد نیاز
export const setPdfOptions = {
  cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
  cMapPacked: true,
  standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/'
};
