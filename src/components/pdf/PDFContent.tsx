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
    const containerWidthPx = window.innerWidth * (containerWidth / 100);
    const newScale = containerWidthPx / baseWidth;
    setScale(Math.min(Math.max(newScale, 0.3), 1.2));
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
    <div className="flex-1 flex flex-col h-full w-full">
      <ScrollArea className="flex-1 w-full">
        <div className="flex flex-col items-center py-6">
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
                  className="relative my-4 w-full max-w-5xl mx-auto px-4"
                >
                  <div className="relative shadow-lg rounded-lg overflow-hidden bg-white">
                    <Page
                      pageNumber={index + 1}
                      width={800 * scale}
                      className="w-full h-auto"
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