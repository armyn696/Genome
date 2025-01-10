import { useEffect, useRef } from 'react';
import { Canvas, Image as FabricImage } from 'fabric';

interface PDFDrawingCanvasProps {
  pageUrl: string;
  isDrawingMode: boolean;
}

export const PDFDrawingCanvas = ({ pageUrl, isDrawingMode }: PDFDrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current);
    canvas.isDrawingMode = isDrawingMode;
    fabricRef.current = canvas;

    // Load the PDF page as background
    FabricImage.fromURL(pageUrl, {
      crossOrigin: 'anonymous',
      scaleX: 1,
      scaleY: 1
    }).then((img) => {
      if (fabricRef.current) {
        img.scaleToWidth(canvas.width || 800);
        fabricRef.current.backgroundImage = img;
        fabricRef.current.renderAll();
      }
    });

    return () => {
      fabricRef.current?.dispose();
      fabricRef.current = null;
    };
  }, [pageUrl]);

  useEffect(() => {
    if (fabricRef.current) {
      fabricRef.current.isDrawingMode = isDrawingMode;
    }
  }, [isDrawingMode]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-auto"
      style={{ maxWidth: '100%' }}
    />
  );
};