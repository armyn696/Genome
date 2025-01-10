import { useEffect, useState } from 'react';
import { retrievePdf } from '@/utils/pdfStorage';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Pencil, Eraser } from 'lucide-react';

interface PDFViewerProps {
  resourceId: string;
}

export const PDFViewer = ({ resourceId }: PDFViewerProps) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  useEffect(() => {
    const loadPdf = async () => {
      const pdf = await retrievePdf(resourceId);
      if (pdf) {
        setPdfUrl(pdf);
      }
    };
    loadPdf();
  }, [resourceId]);

  const toggleDrawingMode = () => {
    setIsDrawingMode(!isDrawingMode);
    // Add drawing mode toggle logic here
    const iframe = document.querySelector('iframe');
    if (iframe) {
      const message = { type: 'toggleDrawing', isDrawing: !isDrawingMode };
      iframe.contentWindow?.postMessage(message, '*');
    }
  };

  const clearDrawing = () => {
    const iframe = document.querySelector('iframe');
    if (iframe) {
      const message = { type: 'clearDrawing' };
      iframe.contentWindow?.postMessage(message, '*');
    }
  };

  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-black">
        Loading PDF...
      </div>
    );
  }

  return (
    <ScrollArea className="h-full bg-black">
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleDrawingMode}
          className={`${isDrawingMode ? 'bg-primary text-primary-foreground' : ''}`}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={clearDrawing}
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          <Eraser className="h-4 w-4" />
        </Button>
      </div>
      <iframe
        src={`${pdfUrl}#toolbar=0`}
        className="w-full h-full"
        title="PDF Viewer"
        style={{ height: 'calc(100vh - 7rem)', backgroundColor: "black" }}
      />
    </ScrollArea>
  );
};