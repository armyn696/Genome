import { useEffect, useRef } from 'react';
import { Canvas, Image } from 'fabric';

interface PDFDrawingCanvasProps {
  isDrawingMode: boolean;
  pageUrl: string;
}

export const PDFDrawingCanvas = ({ isDrawingMode, pageUrl }: PDFDrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: canvasRef.current.offsetWidth,
      height: canvasRef.current.offsetHeight,
    });

    fabricRef.current = canvas;

    // Load the PDF page as background
    Image.fromURL(pageUrl, {
      crossOrigin: 'anonymous'
    }).then((img) => {
      if (fabricRef.current) {
        fabricRef.current.setBackgroundImage(img, fabricRef.current.renderAll.bind(fabricRef.current), {
          scaleX: fabricRef.current.width! / img.width!,
          scaleY: fabricRef.current.height! / img.height!,
        });
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

  // Handle drawing mode changes
  useEffect(() => {
    if (!fabricRef.current) return;
    
    fabricRef.current.isDrawingMode = isDrawingMode;
    if (isDrawingMode && fabricRef.current.freeDrawingBrush) {
      fabricRef.current.freeDrawingBrush.width = 2;
      fabricRef.current.freeDrawingBrush.color = '#ff0000';
    }
  }, [isDrawingMode]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full"
      style={{ touchAction: 'none' }} // Prevent touch scrolling while drawing
    />
  );
};