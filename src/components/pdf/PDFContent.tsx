import { Document, Page, pdfjs } from 'react-pdf';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

// Initialize PDF.js worker with the correct version
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

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
    <ScrollArea className="h-full w-full rounded-md border">
      <div className="p-4 space-y-4">
        {pdfUrl ? (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            className="flex flex-col items-center"
          >
            {Array.from(new Array(numPages || 0), (el, index) => (
              <div key={`page_${index + 1}`} className="mb-4">
                <Page
                  pageNumber={index + 1}
                  width={800}
                  className="shadow-lg rounded-lg overflow-hidden"
                />
              </div>
            ))}
          </Document>
        ) : (
          <div className="text-center text-muted-foreground">
            Loading PDF...
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default PDFContent;