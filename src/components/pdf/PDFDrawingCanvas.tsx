import { useEffect, useRef } from 'react';
import { Canvas, Image, PencilBrush } from 'fabric';

interface PDFDrawingCanvasProps {
  isDrawingMode: boolean;
  pageUrl: string;
}

export const PDFDrawingCanvas = ({ isDrawingMode, pageUrl }: PDFDrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Create new canvas instance
    const canvas = new Canvas(canvasRef.current, {
      isDrawingMode: isDrawingMode,
      width: canvasRef.current.offsetWidth,
      height: canvasRef.current.offsetHeight,
    });

    // Initialize the drawing brush
    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.width = 2;
    canvas.freeDrawingBrush.color = '#ff0000';

    fabricRef.current = canvas;

    // Load the PDF page as background
    Image.fromURL(pageUrl, (img) => {
      if (fabricRef.current) {
        fabricRef.current.backgroundImage = img;
        img.scaleX = fabricRef.current.width! / img.width!;
        img.scaleY = fabricRef.current.height! / img.height!;
        fabricRef.current.renderAll();
      }
    });

    // Cleanup function
    return () => {
      if (fabricRef.current) {
        fabricRef.current.dispose();
        fabricRef.current = null;
      }
    };
  }, [pageUrl]); // Only re-run if pageUrl changes

  useEffect(() => {
    if (!fabricRef.current) return;
    
    fabricRef.current.isDrawingMode = isDrawingMode;
    if (isDrawingMode && fabricRef.current.freeDrawingBrush) {
      fabricRef.current.freeDrawingBrush.width = 2;
      fabricRef.current.freeDrawingBrush.color = '#ff0000';
    }
  }, [isDrawingMode]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};