import { useEffect, useState, useRef } from 'react';
import { retrievePdf } from '@/utils/pdfStorage';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { WandSparkles } from "lucide-react";
import { Canvas } from 'fabric';
import { toast } from "sonner";

interface PDFViewerProps {
  resourceId: string;
  onSendAnnotation?: (imageData: string) => void;
}

export const PDFViewer = ({ resourceId, onSendAnnotation }: PDFViewerProps) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const canvasRef = useRef<Canvas | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const loadPdf = async () => {
      const pdf = await retrievePdf(resourceId);
      if (pdf) {
        setPdfUrl(pdf);
      }
    };
    loadPdf();
  }, [resourceId]);

  const initializeCanvas = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Create a canvas overlay
    const overlay = document.createElement('canvas');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.pointerEvents = isDrawingMode ? 'auto' : 'none';
    
    iframe.parentElement?.appendChild(overlay);

    // Initialize Fabric canvas
    const canvas = new Canvas(overlay, {
      isDrawingMode: true,
      width: iframe.offsetWidth,
      height: iframe.offsetHeight
    });

    // Configure free drawing brush
    canvas.freeDrawingBrush.color = 'red';
    canvas.freeDrawingBrush.width = 2;

    canvasRef.current = canvas;

    // Handle mouse up event to capture the drawing
    canvas.on('mouse:up', () => {
      if (!isDrawingMode) return;
      
      const dataUrl = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 1 // Added the required multiplier property
      });

      if (onSendAnnotation) {
        onSendAnnotation(dataUrl);
        toast.success("Annotation sent to AI chat!");
      }

      // Clear the canvas for the next drawing
      canvas.clear();
    });

    return () => {
      canvas.dispose();
      overlay.remove();
    };
  };

  const toggleDrawingMode = () => {
    setIsDrawingMode(!isDrawingMode);
    if (!isDrawingMode) {
      setTimeout(initializeCanvas, 100);
      toast.info("Drawing mode enabled! Draw circles around text to send to AI.");
    } else if (canvasRef.current) {
      canvasRef.current.dispose();
      canvasRef.current = null;
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
      <div className="absolute top-4 right-4 z-50">
        <Button
          variant={isDrawingMode ? "secondary" : "outline"}
          size="icon"
          onClick={toggleDrawingMode}
          className="bg-background/80 backdrop-blur-sm"
        >
          <WandSparkles className={`h-5 w-5 ${isDrawingMode ? 'text-primary' : ''}`} />
        </Button>
      </div>
      <ScrollArea className="h-full">
        <iframe
          ref={iframeRef}
          src={pdfUrl}
          className="w-full h-full"
          title="PDF Viewer"
          style={{ height: 'calc(100vh - 7rem)', backgroundColor: "black" }}
        />
      </ScrollArea>
    </div>
  );
};