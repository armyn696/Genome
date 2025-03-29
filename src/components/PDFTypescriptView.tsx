import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getOcrTextFromStorage, extractTextFromPdfWithOCR, saveOcrTextToStorage } from '@/services/geminiService';
import { retrievePdf } from '@/utils/pdfStorage';
import { LucideLoader2, RefreshCw } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/components/ui/use-toast';
import { Progress } from "@/components/ui/progress";

interface PDFTypescriptViewProps {
  resourceId: string;
}

export const PDFTypescriptView: React.FC<PDFTypescriptViewProps> = ({ resourceId }) => {
  const [ocrText, setOcrText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pages, setPages] = useState<string[]>([]);
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const { toast } = useToast();

  // بارگذاری متن OCR شده از حافظه محلی هنگام mount کامپوننت
  useEffect(() => {
    const loadOcrText = async () => {
      if (resourceId) {
        const savedText = getOcrTextFromStorage(resourceId);
        if (savedText) {
          setOcrText(savedText);
          // جدا کردن متن به صفحات
          const pageTexts = savedText.split(/===== صفحه \d+ =====/).filter(page => page.trim());
          setPages(pageTexts);
          console.log(`Loaded OCR text for resource ${resourceId}: ${pageTexts.length} pages`);
        } else {
          console.log(`No OCR text found for resource ${resourceId}`);
        }
      }
    };

    loadOcrText();
  }, [resourceId]);

  // انجام OCR برای PDF
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
      
      // ذخیره متن OCR شده
      await saveOcrTextToStorage(resourceId, extractedText);
      setOcrText(extractedText);
      
      // جدا کردن متن به صفحات
      const pageTexts = extractedText.split(/===== صفحه \d+ =====/).filter(page => page.trim());
      setPages(pageTexts);
      
      toast({
        title: "OCR کامل شد",
        description: `متن از ${pageTexts.length} صفحه PDF با موفقیت استخراج شد.`,
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

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // اگر هیچ داده OCR‌ای وجود ندارد
  if (!ocrText && !loading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>متن TypeScript</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center">
          <p className="text-gray-500 mb-4">متن OCR شده‌ای برای این PDF وجود ندارد.</p>
          <Button onClick={performOcr} disabled={loading}>
            {loading ? (
              <>
                <LucideLoader2 className="mr-2 h-4 w-4 animate-spin" />
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
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>متن TypeScript</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={performOcr} 
          disabled={loading}
          className="flex items-center"
        >
          {loading ? (
            <>
              <LucideLoader2 className="mr-2 h-4 w-4 animate-spin" />
              در حال OCR...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              بروزرسانی OCR
            </>
          )}
        </Button>
      </CardHeader>
      
      {loading && (
        <div className="px-6 py-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">OCR در حال اجرا...</span>
            <span className="text-sm font-medium">{ocrProgress}%</span>
          </div>
          <Progress value={ocrProgress} className="h-2" />
        </div>
      )}
      
      <div className="px-6 pb-2 flex-1 overflow-auto">
        <Tabs defaultValue="1" value={currentPage.toString()} className="h-full flex flex-col">
          <TabsList className="mb-2 flex flex-wrap max-w-full overflow-x-auto">
            {pages.map((_, index) => (
              <TabsTrigger 
                key={index + 1} 
                value={(index + 1).toString()}
                onClick={() => handlePageChange(index + 1)}
              >
                صفحه {index + 1}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="flex-1 overflow-auto">
            {pages.map((pageText, index) => (
              <TabsContent 
                key={index + 1} 
                value={(index + 1).toString()}
                className="overflow-auto h-full mt-0"
              >
                <SyntaxHighlighter 
                  language="typescript" 
                  style={vscDarkPlus} 
                  customStyle={{
                    margin: 0,
                    borderRadius: '0.375rem',
                    height: '100%',
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}
                >
                  {pageText}
                </SyntaxHighlighter>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </Card>
  );
};

export default PDFTypescriptView;
