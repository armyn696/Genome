import { useEffect, useRef } from 'react';
import { Canvas, Image } from 'fabric';

interface PDFDrawingCanvasProps {
  pageUrl: string;
  isDrawingMode: boolean;
}

export const PDFDrawingCanvas = ({ pageUrl, isDrawingMode }: PDFDrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: canvasRef.current.width,
      height: canvasRef.current.height,
    });

    fabricRef.current = canvas;

    // Load the PDF page as background using the correct API
    Image.fromURL(pageUrl, {
      crossOrigin: 'anonymous',
    }).then((img) => {
      if (fabricRef.current) {
        fabricRef.current.backgroundImage = img;
        fabricRef.current.renderAll();
      }
    });

    return () => {
      canvas.dispose();
    };
  }, [pageUrl]);

  useEffect(() => {
    if (fabricRef.current) {
      fabricRef.current.isDrawingMode = isDrawingMode;
      if (isDrawingMode && fabricRef.current.freeDrawingBrush) {
        fabricRef.current.freeDrawingBrush.color = '#FF0000';
        fabricRef.current.freeDrawingBrush.width = 2;
      }
    }
  }, [isDrawingMode]);

  return (
    <canvas 
      ref={canvasRef}
      className="w-full h-auto"
    />
  );
};