import { useEffect, useState } from 'react';
import { retrievePdf } from '@/utils/pdfStorage';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Pencil, Eraser } from "lucide-react";

interface PDFViewerProps {
  resourceId: string;
}

export const PDFViewer = ({ resourceId }: PDFViewerProps) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [currentTool, setCurrentTool] = useState<'pencil' | 'eraser'>('pencil');

  useEffect(() => {
    const loadPdf = async () => {
      const pdf = await retrievePdf(resourceId);
      if (pdf) {
        setPdfUrl(pdf);
      }
    };
    loadPdf();
  }, [resourceId]);

  const handleDrawingMode = () => {
    setIsDrawingMode(!isDrawingMode);
    const iframe = document.querySelector('iframe');
    if (iframe) {
      iframe.contentWindow?.postMessage({ type: 'toggleDrawing', enabled: !isDrawingMode }, '*');
    }
  };

  const handleEraserMode = () => {
    setCurrentTool('eraser');
    const iframe = document.querySelector('iframe');
    if (iframe) {
      iframe.contentWindow?.postMessage({ type: 'setTool', tool: 'eraser' }, '*');
    }
  };

  const handlePencilMode = () => {
    setCurrentTool('pencil');
    const iframe = document.querySelector('iframe');
    if (iframe) {
      iframe.contentWindow?.postMessage({ type: 'setTool', tool: 'pencil' }, '*');
    }
  };

  const clearDrawing = () => {
    const iframe = document.querySelector('iframe');
    if (iframe) {
      iframe.contentWindow?.postMessage({ type: 'clearDrawing' }, '*');
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
    <div className="relative h-full bg-black">
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDrawingMode}
          className={isDrawingMode ? 'bg-primary text-primary-foreground' : ''}
        >
          <Pencil className="w-4 h-4" />
        </Button>
        {isDrawingMode && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEraserMode}
              className={currentTool === 'eraser' ? 'bg-primary text-primary-foreground' : ''}
            >
              <Eraser className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePencilMode}
              className={currentTool === 'pencil' ? 'bg-primary text-primary-foreground' : ''}
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
      <ScrollArea className="h-full">
        <iframe
          src={pdfUrl}
          className="w-full h-full"
          title="PDF Viewer"
          style={{ height: 'calc(100vh - 7rem)', backgroundColor: "black" }}
        />
      </ScrollArea>
    </div>
  );
};