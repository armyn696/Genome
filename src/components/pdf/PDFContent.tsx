import { useState } from "react";
import { Document, Page, pdfjs } from 'react-pdf';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFContentProps {
  pdfUrl: string | null;
}

const PDFContent = ({ pdfUrl }: PDFContentProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const { toast } = useToast();

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
    <ScrollArea className="h-[calc(100vh-16rem)] w-full">
      <div className="flex flex-col items-center px-6 py-8">
        {pdfUrl ? (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            className="max-w-4xl mx-auto"
          >
            {Array.from(new Array(numPages || 0), (el, index) => (
              <div 
                key={`page_${index + 1}`} 
                className="mb-8 last:mb-0 w-full flex justify-center"
              >
                <Page
                  pageNumber={index + 1}
                  width={800}
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
  );
};

export default PDFContent;