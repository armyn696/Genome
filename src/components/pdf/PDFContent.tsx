import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from 'react-pdf';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFContentProps {
  pdfUrl: string | null;
  containerWidth: number;
}

const PDFContent = ({ pdfUrl, containerWidth }: PDFContentProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    const baseWidth = 800;
    const minScale = 0.4;
    const maxScale = 1.2;
    const sidePadding = 32; // کاهش padding برای جلوگیری از کات شدن

    // محاسبه عرض با در نظر گرفتن padding کمتر
    const containerWidthPx = (window.innerWidth * (containerWidth / 100)) - (sidePadding * 2);
    
    // محاسبه مقیاس با توجه به عرض جدید
    const newScale = containerWidthPx / baseWidth;
    const clampedScale = Math.min(Math.max(newScale, minScale), maxScale);
    
    setScale(clampedScale);
  }, [containerWidth]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    toast({
      title: "PDF loaded successfully",
      description: `Document has ${numPages} pages`
    });
  }

  function onDocumentLoadError(error: Error) {
    console.error("Error loading PDF:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to load the PDF file"
    });
  }

  return (
    <div className="h-full w-full relative overflow-hidden">
      <ScrollArea className="h-full absolute inset-0">
        <div className="flex flex-col items-center px-4 py-6 min-h-full"> {/* کاهش padding */}
          {pdfUrl ? (
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              className="flex flex-col items-center w-full"
            >
              {Array.from(new Array(numPages || 0), (el, index) => (
                <div 
                  key={`page_${index + 1}`} 
                  className="mb-8 last:mb-0 flex justify-center w-full"
                >
                  <div className="max-w-full"> {/* اضافه کردن wrapper برای جلوگیری از overflow */}
                    <Page
                      pageNumber={index + 1}
                      width={800 * scale}
                      className="shadow-lg rounded-lg overflow-hidden bg-white"
                      renderAnnotationLayer={false}
                      renderTextLayer={false}
                    />
                  </div>
                </div>
              ))}
            </Document>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Loading PDF...
            </div>
          )}
        </div>
        <ScrollBar />
      </ScrollArea>
    </div>
  );
};

export default PDFContent;