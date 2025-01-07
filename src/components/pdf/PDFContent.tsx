import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ScrollArea } from "@/components/ui/scroll-area";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFContentProps {
  pdfUrl: string | null;
  containerWidth: number;
}

const PDFContent = ({ pdfUrl, containerWidth }: PDFContentProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const baseWidth = 800;
    const containerWidthPx = window.innerWidth * (containerWidth / 100);
    const padding = 80; // Increased padding for better visibility and to avoid resize handle
    const newScale = Math.min(1, (containerWidthPx - padding) / baseWidth);
    setScale(newScale);
  }, [containerWidth]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>No PDF file selected</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <ScrollArea className="h-full w-full">
        <div className="flex flex-col items-center p-8 min-h-full">
          {pdfUrl ? (
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              className="max-w-full"
            >
              {Array.from(new Array(numPages), (el, index) => (
                <Page
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  scale={scale}
                  className="mb-4 shadow-lg"
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
              ))}
            </Document>
          ) : (
            <p>Loading PDF...</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PDFContent;