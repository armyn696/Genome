import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Image } from "fabric";

interface PDFDrawingCanvasProps {
  pageUrl: string;
  isDrawingMode: boolean;
}

export const PDFDrawingCanvas = ({ pageUrl, isDrawingMode }: PDFDrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      isDrawingMode: true,
      width: 800,
      height: 600,
    });

    // Set up drawing brush
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = '#FF0000';
      canvas.freeDrawingBrush.width = 2;
    }

    Image.fromURL(pageUrl, {
      crossOrigin: 'anonymous',
    }).then((img) => {
      if (!img) return;
      
      canvas.backgroundImage = img;
      img.scaleX = canvas.getWidth() / (img.width ?? 1);
      img.scaleY = canvas.getHeight() / (img.height ?? 1);
      canvas.renderAll();
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [pageUrl]);

  useEffect(() => {
    if (fabricCanvas) {
      fabricCanvas.isDrawingMode = isDrawingMode;
      fabricCanvas.renderAll();
    }
  }, [isDrawingMode]);

  return (
    <canvas 
      ref={canvasRef} 
      className="max-w-full h-auto shadow-lg rounded-lg"
      style={{
        width: '100%',
        height: 'auto',
        objectFit: 'contain'
      }}
    />
  );
};