import { useEffect, useState, useRef } from 'react';
import { retrievePdf } from '@/utils/pdfStorage';
import { ScrollArea } from "@/components/ui/scroll-area";

interface PDFViewerProps {
  resourceId: string;
}

export const PDFViewer = ({ resourceId }: PDFViewerProps) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const loadPdf = async () => {
      const pdf = await retrievePdf(resourceId);
      if (pdf) {
        setPdfUrl(pdf);
      }
    };
    loadPdf();
  }, [resourceId]);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.strokeStyle = 'white';
        context.lineWidth = 2;
        context.lineCap = 'round';
        contextRef.current = context;
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    contextRef.current?.beginPath();
    contextRef.current?.moveTo(x, y);
    setMousePosition({ x, y });
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
    setMousePosition({ x, y });
  };

  const stopDrawing = () => {
    if (contextRef.current) {
      contextRef.current.closePath();
    }
    setIsDrawing(false);
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
      <div className="relative">
        <iframe
          src={pdfUrl}
          className="w-full h-full"
          title="PDF Viewer"
          style={{ height: 'calc(100vh - 7rem)', backgroundColor: "black" }}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </ScrollArea>
  );
};