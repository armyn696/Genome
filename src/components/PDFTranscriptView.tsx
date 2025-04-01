import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { extractTextFromPdfWithOCR } from '@/services/geminiService';
import { retrievePdf } from '@/utils/pdfStorage';
import { LucideLoader2, RefreshCw, Edit, Save, X, Search, HighlighterIcon } from 'lucide-react';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useToast } from '@/components/ui/use-toast';
import { Progress } from "@/components/ui/progress";
import { saveOcrTextToSupabase, getOcrTextFromSupabase, updatePageTextInSupabase } from '@/services/ocrStorageService';

interface PDFTranscriptViewProps {
  resourceId: string;
  highlightWords?: Array<{text: string, type: string}>;
  currentHighlightPage?: number;
  viewType?: 'transcript' | 'jozveh';
}

export const PDFTranscriptView: React.FC<PDFTranscriptViewProps> = ({ 
  resourceId,
  highlightWords = [],
  currentHighlightPage,
  viewType = 'transcript'
}) => {
  const [ocrText, setOcrText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pages, setPages] = useState<string[]>([]);
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [pageHighlights, setPageHighlights] = useState<{[page: number]: Array<{text: string, type: string}>}>({});
  const { toast } = useToast();
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // بارگذاری متن OCR شده از Supabase هنگام mount کامپوننت
  useEffect(() => {
    const loadOcrText = async () => {
      if (resourceId) {
        try {
          setLoading(true);
          const savedText = await getOcrTextFromSupabase(resourceId);
          if (savedText) {
            setOcrText(savedText);
            
            // اضافه کردن گزارش اشکال‌زدایی
            const pageMarkers = (savedText.match(/===== صفحه \d+ =====/g) || []);
            console.log(`Page markers in loaded OCR text: ${pageMarkers.length}`);
            console.log(`Markers: ${pageMarkers.slice(0, 3).join(', ')}...${pageMarkers.slice(-3).join(', ')}`);
            
            // بهبود جداسازی صفحات برای جلوگیری از گم شدن صفحات
            const pageTexts = savedText.split(/===== صفحه \d+ =====/)
              .filter(page => page.trim().length > 0); // حذف صفحات خالی
              
            console.log(`After split: found ${pageTexts.length} pages with content`);
            
            // اگر تعداد صفحات با تعداد نشانگرها مطابقت ندارد، گزارش دهید
            if (pageTexts.length !== pageMarkers.length) {
              console.warn(`Warning: Page count mismatch! Markers: ${pageMarkers.length}, Content pages: ${pageTexts.length}`);
              
              // در صورتی که صفحات گم شده باشند، گزارش جزئیات بیشتر
              if (pageTexts.length < pageMarkers.length) {
                const firstPagesSample = pageTexts.slice(0, 2).map(p => p.substring(0, 50).trim());
                console.log(`First pages sample: ${JSON.stringify(firstPagesSample)}`);
                
                // بررسی صفحات خالی
                const allSplitPages = savedText.split(/===== صفحه \d+ =====/);
                const emptyPages = allSplitPages.map((p, i) => ({ index: i, isEmpty: p.trim().length === 0 }))
                  .filter(p => p.isEmpty);
                console.log(`Empty pages at indices: ${emptyPages.map(p => p.index).join(', ')}`);
              }
            }
              
            setPages(pageTexts);
            console.log(`Loaded OCR text for resource ${resourceId}: ${pageTexts.length} pages`);
          } else {
            console.log(`No OCR text found for resource ${resourceId}`);
          }
        } catch (error) {
          console.error('Error loading OCR text:', error);
          toast({
            title: "خطا در بارگیری متن OCR",
            description: "متن OCR شده از سرور بارگیری نشد. لطفاً دوباره تلاش کنید.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
    };

    loadOcrText();
  }, [resourceId, toast]);

  // اگر صفحه هایلایت تغییر کرد، به آن صفحه برویم
  useEffect(() => {
    if (currentHighlightPage && currentHighlightPage > 0 && currentHighlightPage <= pages.length) {
      setCurrentPage(currentHighlightPage);
    }
  }, [currentHighlightPage, pages.length]);

  // به‌روزرسانی هایلایت‌های دریافتی
  useEffect(() => {
    if (currentHighlightPage && highlightWords.length > 0) {
      console.log(`Received highlights for page ${currentHighlightPage}:`, highlightWords);
      setPageHighlights(prev => ({
        ...prev,
        [currentHighlightPage]: highlightWords
      }));
    }
  }, [highlightWords, currentHighlightPage]);

  // انجام OCR برای PDF و ذخیره در Supabase
  const performOcr = async () => {
    try {
      setLoading(true);
      setOcrProgress(0);
      toast({
        title: "شروع OCR",
        description: "در حال استخراج متن از PDF با OCR. این فرآیند ممکن است چند دقیقه طول بکشد.",
        variant: "default",
      });

      // بازیابی URL فایل PDF
      const pdfUrl = await retrievePdf(resourceId, '');
      if (!pdfUrl) {
        throw new Error("فایل PDF یافت نشد");
      }

      // انجام OCR با استفاده از Gemini Flash-2 با ارسال callback برای پیشرفت
      const extractedText = await extractTextFromPdfWithOCR(pdfUrl, (progress) => {
        setOcrProgress(progress);
      });
      
      // اضافه کردن گزارش اشکال‌زدایی
      const pageMarkers = (extractedText.match(/===== صفحه \d+ =====/g) || []);
      console.log(`Page markers in new OCR text: ${pageMarkers.length}`);
      console.log(`First/last markers: ${pageMarkers.slice(0, 3).join(', ')}...${pageMarkers.slice(-3).join(', ')}`);
      
      // ذخیره متن OCR شده در Supabase
      await saveOcrTextToSupabase(resourceId, extractedText);
      setOcrText(extractedText);
      
      // بهبود جداسازی صفحات
      const pageTexts = extractedText.split(/===== صفحه \d+ =====/)
        .filter(page => page.trim().length > 0); // حذف صفحات خالی
        
      console.log(`Page texts after split: ${pageTexts.length}`);
        
      setPages(pageTexts);
      
      toast({
        title: "OCR کامل شد",
        description: `متن از ${pageTexts.length} صفحه PDF با موفقیت استخراج و در دیتابیس ذخیره شد.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error performing OCR:", error);
      toast({
        title: "خطا در OCR",
        description: error instanceof Error ? error.message : "خطای ناشناخته در استخراج متن",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // شروع عملیات ویرایش متن
  const startEditing = () => {
    if (!isEditing && pages.length > 0) {
      setEditedText(pages[currentPage - 1]);
      setIsEditing(true);
      
      // فوکوس روی تکست‌اریا پس از رندر
      setTimeout(() => {
        if (editTextareaRef.current) {
          editTextareaRef.current.focus();
        }
      }, 100);
    }
  };

  // لغو عملیات ویرایش
  const cancelEditing = () => {
    setIsEditing(false);
    setEditedText("");
  };

  // تغییر صفحه فعلی
  const handlePageChange = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > pages.length) return;
    
    // اگر در حال ویرایش هستیم، ویرایش را لغو می‌کنیم
    if (isEditing) {
      const shouldContinue = window.confirm("تغییرات ذخیره نشده‌اند. آیا مطمئن هستید که می‌خواهید صفحه را تغییر دهید؟");
      if (!shouldContinue) return;
      cancelEditing();
    }
    
    setCurrentPage(pageNumber);
  };

  // ذخیره متن ویرایش شده
  const saveEditedText = async () => {
    try {
      setLoading(true);
      const success = await updatePageTextInSupabase(resourceId, currentPage, editedText);
      
      if (success) {
        // به‌روزرسانی state محلی
        const updatedPages = [...pages];
        updatedPages[currentPage - 1] = editedText;
        setPages(updatedPages);
        
        toast({
          title: "ذخیره موفق",
          description: `تغییرات صفحه ${currentPage} با موفقیت در Supabase ذخیره شد.`,
          variant: "default",
        });
        
        setIsEditing(false);
      } else {
        toast({
          title: "خطا در ذخیره",
          description: "متأسفانه عملیات به‌روزرسانی با مشکل مواجه شد.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving edited text:", error);
      toast({
        title: "خطا",
        description: "مشکلی در ذخیره تغییرات پیش آمد.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // تابع کمکی برای هایلایت کردن متن
  const highlightText = (text: string, wordsToHighlight: Array<{text: string, type: string}> = []) => {
    if (!wordsToHighlight || wordsToHighlight.length === 0) return text;
    
    console.log('Words to highlight:', wordsToHighlight);
    
    // کلاس‌های هایلایت براساس نوع
    const highlightClasses: {[key: string]: string} = {
      'key': 'bg-red-300/40 dark:bg-red-700/30 rounded px-0.5 py-0.5', // قرمز برای قیدها و نکات کلیدی با شفافیت 40%
      'main': 'bg-yellow-300/40 dark:bg-yellow-600/30 rounded px-0.5 py-0.5', // زرد برای ایده‌های اصلی با شفافیت 40%
      'detail': 'bg-green-200/40 dark:bg-green-600/30 rounded px-0.5 py-0.5', // سبز برای مثال‌ها و جزئیات با شفافیت 40%
    };
    
    // مرتب کردن کلمات بر اساس طول (طولانی‌ترین اول) برای جلوگیری از هایلایت کردن بخشی از کلمات بزرگتر
    const sortedWords = [...wordsToHighlight].sort((a, b) => b.text.length - a.text.length);
    
    // پیش‌پردازش متن اصلی برای حفظ خط‌های جدید در regex
    const newlineMarker = "___NEWLINE___";
    const textWithMarkers = text.replace(/\n/g, newlineMarker);
    let resultHtml = textWithMarkers;
    
    // هایلایت کردن هر عبارت با توجه به انواع مختلف الگوها
    for (const word of sortedWords) {
      if (!word || !word.text || word.text.trim() === '') continue;
      
      try {
        // عبارت تمیز شده
        const cleanPhrase = word.text.trim();
        
        // انتخاب کلاس هایلایت براساس نوع عبارت
        const highlightClass = highlightClasses[word.type] || highlightClasses['main']; // استفاده از زرد به عنوان رنگ پیش‌فرض
        
        // استراتژی 1: تطبیق دقیق عبارت (با escape کردن کاراکترهای خاص)
        const escapedPhrase = cleanPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                                        .replace(/\n/g, newlineMarker);
        
        // ساخت regex با حالت‌های مختلف برای افزایش احتمال تطبیق
        const exactRegex = new RegExp(`(${escapedPhrase})`, 'g');
        const caseInsensitiveRegex = new RegExp(`(${escapedPhrase})`, 'gi');
        
        // بررسی اگر عبارت دقیق وجود دارد
        if (resultHtml.match(exactRegex)) {
          resultHtml = resultHtml.replace(
            exactRegex,
            `<span class="${highlightClass}">$1</span>`
          );
          continue;
        }
        
        // اگر مطابقت دقیق نبود، تلاش با حالت case-insensitive
        if (resultHtml.match(caseInsensitiveRegex)) {
          resultHtml = resultHtml.replace(
            caseInsensitiveRegex,
            `<span class="${highlightClass}">$1</span>`
          );
          continue;
        }
        
        // استراتژی 2: برای عبارات چند کلمه‌ای، پشتیبانی از فاصله‌های انعطاف‌پذیر
        if (cleanPhrase.includes(' ')) {
          const words = cleanPhrase.split(' ').filter(w => w.trim() !== '');
          if (words.length > 1) {
            // ایجاد الگوی regex برای کلمات با فاصله‌های انعطاف‌پذیر
            const escapedWords = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
            const flexPattern = escapedWords.join('\\s+');
            const flexRegex = new RegExp(`(${flexPattern})`, 'gi');
            
            if (resultHtml.match(flexRegex)) {
              resultHtml = resultHtml.replace(
                flexRegex,
                `<span class="${highlightClass}">$1</span>`
              );
              continue;
            }
          }
        }
        
        // استراتژی 3: پشتیبانی خاص برای اصطلاحات پزشکی/علمی
        if (/[A-Za-z][0-9]|[0-9]\/[0-9]/.test(cleanPhrase)) {
          // برای اصطلاحات مثل S2, P2, 3/6 
          let medicalPattern = cleanPhrase
            .replace(/([A-Za-z]+)(\s*)([0-9]+)/g, '(?:[A-Za-z]+)\\s*$3') // S2 -> S\s*2
            .replace(/([0-9]+)(\s*)(\/|-)(\s*)([0-9]+)/g, '$1\\s*$3\\s*$5'); // 3/6 -> 3\s*\/\s*6
            
          const medicalRegex = new RegExp(`(${medicalPattern})`, 'gi');
          
          if (resultHtml.match(medicalRegex)) {
            resultHtml = resultHtml.replace(
              medicalRegex,
              `<span class="${highlightClass}">$1</span>`
            );
            continue;
          }
        }
        
        // استراتژی 4: جستجوی فازی برای کلمات تکی
        if (!cleanPhrase.includes(' ') && cleanPhrase.length > 2) {
          // برای کلمات تکی، امکان وجود کاراکترهای اضافی را در نظر می‌گیریم
          const fuzzyPattern = cleanPhrase.split('').join('\\s*');
          const fuzzyRegex = new RegExp(`\\b(${fuzzyPattern})\\b`, 'gi');
          
          if (resultHtml.match(fuzzyRegex)) {
            resultHtml = resultHtml.replace(
              fuzzyRegex,
              `<span class="${highlightClass}">$1</span>`
            );
            continue;
          }
        }
        
        // استراتژی 5: برای بخش‌های عددی، مثل ۳/۶ یا 3/6 با تبدیل اعداد فارسی/انگلیسی
        if (/[\u06F0-\u06F9]|[0-9]/.test(cleanPhrase)) {
          // تبدیل اعداد فارسی به انگلیسی و برعکس
          const persianToEnglishMap: {[key: string]: string} = {
            '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
            '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
          };
          const englishToPersianMap: {[key: string]: string} = {
            '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
            '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹'
          };
          
          // نسخه با اعداد تبدیل شده
          let persianNumberPhrase = cleanPhrase.replace(/[0-9]/g, m => englishToPersianMap[m] || m);
          let englishNumberPhrase = cleanPhrase.replace(/[\u06F0-\u06F9]/g, m => persianToEnglishMap[m] || m);
          
          // ایجاد regex برای هر دو حالت
          const persianRegex = new RegExp(`(${persianNumberPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'g');
          const englishRegex = new RegExp(`(${englishNumberPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'g');
          
          if (resultHtml.match(persianRegex)) {
            resultHtml = resultHtml.replace(
              persianRegex,
              `<span class="${highlightClass}">$1</span>`
            );
            continue;
          }
          
          if (resultHtml.match(englishRegex)) {
            resultHtml = resultHtml.replace(
              englishRegex,
              `<span class="${highlightClass}">$1</span>`
            );
            continue;
          }
        }
      } catch (error) {
        console.error(`Error highlighting phrase "${word.text}":`, error);
      }
    }
    
    // بازگرداندن مارکرهای خط جدید به خطوط واقعی
    return resultHtml.replace(new RegExp(newlineMarker, 'g'), '\n');
  };

  // اگر هیچ داده OCR‌ای وجود ندارد
  if (!ocrText && !loading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="border-b relative">
          <CardTitle className="text-2xl font-bold text-gray-100">
            <span>
              {viewType === 'jozveh' 
                ? 'جزوه (Jozveh)'
                : 'متن رونوشت (Transcript)'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center">
          <p className="text-white mb-4 text-lg font-semibold py-2 px-4">متن OCR شده‌ای برای این PDF وجود ندارد.</p>
          <Button 
            onClick={performOcr} 
            disabled={loading}
            size="lg"
            className="font-bold py-2 text-base"
          >
            {loading ? (
              <>
                <LucideLoader2 className="mr-3 h-5 w-5 animate-spin" />
                در حال OCR...
              </>
            ) : (
              <>استخراج متن با OCR</>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // نمایش رابط کاربری اصلی
  return (
    <Card className="h-full flex flex-col relative">
      <CardHeader className="border-b relative pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-gray-100">
            <span>
              {viewType === 'jozveh' 
                ? 'جزوه (Jozveh)'
                : 'متن رونوشت (Transcript)'}
            </span>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {highlightWords && highlightWords.length > 0 && (
              <div className="flex items-center gap-1">
                <HighlighterIcon className="h-4 w-4 text-yellow-400" />
                <span className="text-xs text-yellow-400">{highlightWords.length} مورد هایلایت</span>
              </div>
            )}
            
            <Button 
              onClick={performOcr} 
              disabled={loading} 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
            >
              {loading ? <LucideLoader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="sr-only">به‌روزرسانی OCR</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {loading && ocrProgress > 0 && (
        <div className="px-4 py-2 bg-black/20">
          <div className="flex justify-between items-center text-xs mb-1">
            <span>استخراج متن با OCR...</span>
            <span>{Math.round(ocrProgress)}%</span>
          </div>
          <Progress value={ocrProgress} className="h-1" />
        </div>
      )}
      
      <div className="px-6 py-4 flex-1 overflow-auto">
        <Tabs defaultValue="1" value={currentPage.toString()} className="h-full flex flex-col">
          <div className="relative border-b border-gray-700 mb-4 pb-3">
            <div className="flex justify-between items-center mb-1">
              <button 
                onClick={() => handlePageChange(1)} 
                className="text-white hover:text-primary transition-colors text-sm font-medium"
              >
                ابتدا
              </button>
              
              <div className="text-center px-2">
                <span className="text-primary font-bold">
                  صفحه {currentPage} از {pages.length}
                </span>
              </div>
              
              <button 
                onClick={() => handlePageChange(pages.length)} 
                className="text-white hover:text-primary transition-colors text-sm font-medium"
              >
                انتها
              </button>
            </div>
            
            <div className="w-full overflow-x-auto pb-1 scrollbar-none">
              <div className="flex min-w-max justify-start">
                {pages.map((_, index) => (
                  <button
                    key={index + 1}
                    className={`px-3 py-1 text-sm font-medium transition-colors mx-0.5 rounded-sm ${
                      currentPage === index + 1
                        ? 'bg-primary text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto h-full">
            {pages.map((pageText, index) => (
              <TabsContent 
                key={index + 1} 
                value={(index + 1).toString()}
                className="overflow-auto h-full mt-0 flex-1"
              >
                {isEditing && currentPage === index + 1 ? (
                  <div className="relative p-5 whitespace-pre-wrap rounded-md backdrop-blur-sm border border-gray-700 shadow-md min-h-[300px] h-full">
                    <div className="flex justify-end space-x-2 mb-3">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={cancelEditing}
                        disabled={loading}
                        className="h-8 px-2 text-gray-400 hover:text-white"
                      >
                        <X size={16} />
                        <span className="mr-1">لغو</span>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="default" 
                        onClick={saveEditedText}
                        disabled={loading}
                        className="h-8 px-3 bg-primary hover:bg-primary/90"
                      >
                        {loading ? <LucideLoader2 className="animate-spin mr-1" size={16} /> : <Save size={16} className="mr-1" />}
                        ذخیره
                      </Button>
                    </div>
                    <textarea 
                      ref={editTextareaRef}
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      className="w-full h-[calc(100%-45px)] p-0 bg-transparent text-white border-0 focus:ring-0 focus:outline-none resize-none font-medium leading-relaxed text-base text-left"
                      dir="auto"
                      disabled={loading}
                      style={{ minHeight: "200px" }}
                    />
                  </div>
                ) : (
                  <div 
                    ref={contentRef}
                    className="relative p-5 whitespace-pre-wrap leading-relaxed text-white text-base font-medium rounded-md backdrop-blur-sm border border-gray-700 shadow-md"
                    dir="auto"
                    dangerouslySetInnerHTML={{
                      __html: 
                        // استفاده از حافظه داخلی برای نمایش هایلایت‌های هر صفحه
                        pageHighlights[index + 1] && pageHighlights[index + 1].length > 0
                          ? highlightText(pageText, pageHighlights[index + 1])
                          : pageText
                    }}
                  >
                  </div>
                )}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </Card>
  );
};

export default PDFTranscriptView;
