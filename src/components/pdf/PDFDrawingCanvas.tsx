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
      crossOrigin: 'anonymous',
    }).then((img) => {
      if (fabricRef.current) {
        // In Fabric.js v6, we set the background image directly
        fabricRef.current.backgroundImage = img;
        if (img.width && img.height && fabricRef.current.width && fabricRef.current.height) {
          img.scaleX = fabricRef.current.width / img.width;
          img.scaleY = fabricRef.current.height / img.height;
        }
        fabricRef.current.renderAll();
      }
    });

    // Cleanup function
    return () => {
      if (fabricRef.current) {
        // Important: Remove all event listeners and dispose of the canvas
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