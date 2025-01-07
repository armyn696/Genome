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
    // Adjust scale calculation to be more responsive from the start
    const containerWidthPx = window.innerWidth * (containerWidth / 100);
    const newScale = Math.max(0.5, Math.min(1, containerWidthPx / (baseWidth + 100)));
    setScale(newScale);
  }, [containerWidth]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    console.log("PDF loaded successfully with", numPages, "pages");
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
        <div className="flex flex-col items-center p-6 min-h-full">
          {pdfUrl ? (
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              className="flex flex-col items-center mx-auto"
            >
              {Array.from(new Array(numPages || 0), (el, index) => (
                <div 
                  key={`page_${index + 1}`} 
                  className="mb-8 last:mb-0 flex justify-center"
                >
                  <Page
                    pageNumber={index + 1}
                    width={800 * scale}
                    className="shadow-lg rounded-lg overflow-hidden bg-white"
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                  />
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