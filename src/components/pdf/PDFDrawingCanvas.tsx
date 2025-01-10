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

    // Get the parent container width
    const parentWidth = canvasRef.current.parentElement?.clientWidth || 800;
    
    // Create canvas with parent width
    const canvas = new Canvas(canvasRef.current, {
      width: parentWidth,
      height: parentWidth * 1.414, // Approximate A4 ratio
      backgroundColor: '#ffffff'
    });
    
    canvas.isDrawingMode = isDrawingMode;
    fabricRef.current = canvas;

    // Load the PDF page as background
    FabricImage.fromURL(pageUrl, {
      crossOrigin: 'anonymous'
    }).then((img) => {
      if (fabricRef.current) {
        // Calculate scale to fit width while maintaining aspect ratio
        const scale = parentWidth / img.width!;
        img.scale(scale);
        
        // Manually center the image
        const canvasCenter = {
          x: fabricRef.current.width! / 2,
          y: fabricRef.current.height! / 2
        };
        
        img.set({
          left: canvasCenter.x - (img.width! * scale) / 2,
          top: canvasCenter.y - (img.height! * scale) / 2
        });
        
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
    />
  );
};