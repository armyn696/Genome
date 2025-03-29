import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { extractTextFromPdfWithOCR } from '@/services/geminiService';
import { retrievePdf } from '@/utils/pdfStorage';
import { LucideLoader2, RefreshCw, Edit, Save, X } from 'lucide-react';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useToast } from '@/components/ui/use-toast';
import { Progress } from "@/components/ui/progress";
import { saveOcrTextToSupabase, getOcrTextFromSupabase, updatePageTextInSupabase } from '@/services/ocrStorageService';

interface PDFTranscriptViewProps {
  resourceId: string;
}

export const PDFTranscriptView: React.FC<PDFTranscriptViewProps> = ({ resourceId }) => {
  const [ocrText, setOcrText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pages, setPages] = useState<string[]>([]);
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");
  const { toast } = useToast();
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  // بارگذاری متن OCR شده از Supabase هنگام mount کامپوننت
  useEffect(() => {
    const loadOcrText = async () => {
      if (resourceId) {
        try {
          setLoading(true);
          const savedText = await getOcrTextFromSupabase(resourceId);
          if (savedText) {
            setOcrText(savedText);
            // جدا کردن متن به صفحات
            const pageTexts = savedText.split(/===== صفحه \d+ =====/).filter(page => page.trim());
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
      const pdfUrl = await retrievePdf(resourceId);
      if (!pdfUrl) {
        throw new Error("فایل PDF یافت نشد");
      }

      // انجام OCR با استفاده از Gemini Flash-2 با ارسال callback برای پیشرفت
      const extractedText = await extractTextFromPdfWithOCR(pdfUrl, (progress) => {
        setOcrProgress(progress);
      });
      
      // ذخیره متن OCR شده در Supabase
      await saveOcrTextToSupabase(resourceId, extractedText);
      setOcrText(extractedText);
      
      // جدا کردن متن به صفحات
      const pageTexts = extractedText.split(/===== صفحه \d+ =====/).filter(page => page.trim());
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

  // تغییر صفحه فعلی
  const handlePageChange = (pageNumber: number) => {
    if (isEditing) {
      // اگر در حال ویرایش هستیم، هشدار بدهیم
      if (window.confirm('تغییرات ذخیره نشده‌اند. آیا می‌خواهید بدون ذخیره از این صفحه خارج شوید؟')) {
        setIsEditing(false);
      } else {
        return;
      }
    }
    
    setCurrentPage(pageNumber);
  };

  // شروع ویرایش متن صفحه
  const startEditing = () => {
    setEditedText(pages[currentPage - 1]);
    setIsEditing(true);
    // تمرکز بر روی textarea بعد از رندر
    setTimeout(() => {
      if (editTextareaRef.current) {
        editTextareaRef.current.focus();
      }
    }, 100);
  };

  // لغو ویرایش
  const cancelEditing = () => {
    setIsEditing(false);
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

  // اگر هیچ داده OCR‌ای وجود ندارد
  if (!ocrText && !loading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="border-b relative">
          <CardTitle className="text-2xl font-bold text-gray-100">
            <span>متن رونوشت (Transcript)</span>
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

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b relative">
        <CardTitle className="text-2xl font-bold text-gray-100">
          <span>متن رونوشت (Transcript)</span>
        </CardTitle>
        <Button 
          variant="outline" 
          size="default" 
          onClick={performOcr} 
          disabled={loading}
          className="flex items-center font-bold"
        >
          {loading ? (
            <>
              <LucideLoader2 className="mr-2 h-5 w-5 animate-spin" />
              در حال OCR...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-5 w-5" />
              بروزرسانی OCR
            </>
          )}
        </Button>
      </CardHeader>
      
      {loading && (
        <div className="px-6 py-4 relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-semibold text-white">OCR در حال اجرا...</span>
            <span className="text-lg font-bold text-primary">{ocrProgress}%</span>
          </div>
          <div className="relative">
            <Progress value={ocrProgress} />
          </div>
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
                  <div className="relative p-5 whitespace-pre-wrap leading-relaxed text-white text-base font-medium rounded-md backdrop-blur-sm border border-gray-700 shadow-md">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={startEditing}
                      className="absolute top-2 right-2 h-8 w-8 p-0 opacity-50 hover:opacity-100 hover:bg-gray-800"
                    >
                      <Edit size={16} />
                      <span className="sr-only">ویرایش متن</span>
                    </Button>
                    {pageText}
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
