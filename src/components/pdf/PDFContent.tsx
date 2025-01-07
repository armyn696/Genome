import { useState } from "react";
import { Document, Page, pdfjs } from 'react-pdf';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFContentProps {
  pdfUrl: string | null;
}

const PDFContent = ({ pdfUrl }: PDFContentProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [leftPanelSize, setLeftPanelSize] = useState(30);
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

  const getGridCols = (size: number) => {
    if (size < 30) return 'grid-cols-1';
    if (size < 60) return 'grid-cols-2';
    return 'grid-cols-3';
  };

  const renderThumbnails = () => {
    return Array.from(new Array(numPages || 0), (el, index) => (
      <div 
        key={`thumb_${index + 1}`}
        className={`cursor-pointer p-2 ${currentPage === index + 1 ? 'bg-primary/10 rounded-lg' : ''}`}
        onClick={() => setCurrentPage(index + 1)}
      >
        <Page
          pageNumber={index + 1}
          width={150}
          className="shadow-sm rounded-lg overflow-hidden"
        />
      </div>
    ));
  };

  const renderPreview = () => {
    return (
      <div className="flex justify-center p-4">
        <Page
          pageNumber={currentPage}
          width={800}
          className="shadow-lg rounded-lg overflow-hidden"
        />
      </div>
    );
  };

  return (
    <div className="h-full">
      {pdfUrl ? (
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
        >
          <ResizablePanelGroup direction="horizontal" className="min-h-[600px] rounded-lg border">
            <ResizablePanel 
              defaultSize={30} 
              minSize={20} 
              maxSize={40}
              onResize={setLeftPanelSize}
            >
              <ScrollArea className="h-full">
                <div className={`grid ${getGridCols(leftPanelSize)} gap-2 p-4`}>
                  {renderThumbnails()}
                </div>
              </ScrollArea>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={70} minSize={60}>
              <ScrollArea className="h-full">
                {renderPreview()}
              </ScrollArea>
            </ResizablePanel>
          </ResizablePanelGroup>
        </Document>
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Loading PDF...
        </div>
      )}
    </div>
  );
};

export default PDFContent;