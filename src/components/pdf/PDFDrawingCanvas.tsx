import { useEffect, useRef, useState } from 'react';
import { Canvas, Image } from 'fabric';

interface PDFDrawingCanvasProps {
  isDrawingMode: boolean;
  pageUrl: string;
}

export const PDFDrawingCanvas = ({ isDrawingMode, pageUrl }: PDFDrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Initialize canvas only once
  useEffect(() => {
    if (!canvasRef.current) return;

    const container = canvasRef.current.parentElement;
    if (!container) return;

    // Set initial dimensions
    const width = container.clientWidth;
    const height = container.clientHeight;
    setDimensions({ width, height });

    // Create canvas with proper dimensions
    const canvas = new Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: 'transparent',
    });

    fabricRef.current = canvas;

    // Load the PDF page as background
    Image.fromURL(pageUrl, {
      crossOrigin: 'anonymous',
    }).then((img) => {
      if (!fabricRef.current) return;

      // Set background image
      fabricRef.current.backgroundImage = img;

      // Scale image to fit canvas
      if (img.width && img.height) {
        const scaleX = width / img.width;
        const scaleY = height / img.height;
        img.scale(Math.min(scaleX, scaleY));
      }

      fabricRef.current.renderAll();
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

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !fabricRef.current) return;

      const container = canvasRef.current.parentElement;
      if (!container) return;

      const width = container.clientWidth;
      const height = container.clientHeight;

      fabricRef.current.setDimensions({ width, height });
      setDimensions({ width, height });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      style={{ 
        width: '100%',
        height: '100%',
        touchAction: 'none' // Prevent touch scrolling while drawing
      }}
    />
  );
};