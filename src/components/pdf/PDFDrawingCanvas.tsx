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

    const canvas = new Canvas(canvasRef.current);
    canvas.isDrawingMode = isDrawingMode;
    fabricRef.current = canvas;

    // Load the PDF page as background
    fabric.Image.fromURL(pageUrl, (img) => {
      if (fabricRef.current) {
        img.scaleToWidth(canvas.width || 800);
        fabricRef.current.setBackgroundImage(img, fabricRef.current.renderAll.bind(fabricRef.current));
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