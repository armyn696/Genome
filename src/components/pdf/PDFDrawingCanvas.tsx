import { useEffect, useRef } from 'react';
import { Canvas, Image } from 'fabric';

interface PDFDrawingCanvasProps {
  isDrawingMode: boolean;
  pageUrl: string;
}

export const PDFDrawingCanvas = ({ isDrawingMode, pageUrl }: PDFDrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      isDrawingMode: isDrawingMode,
      width: canvasRef.current.offsetWidth,
      height: canvasRef.current.offsetHeight,
    });

    fabricRef.current = canvas;

    // Load the PDF page as background
    Image.fromURL(pageUrl).then((img) => {
      canvas.backgroundImage = img;
      img.scaleX = canvas.width! / img.width!;
      img.scaleY = canvas.height! / img.height!;
      canvas.renderAll();
    });

    return () => {
      canvas.dispose();
    };
  }, [pageUrl]);

  useEffect(() => {
    if (!fabricRef.current) return;
    fabricRef.current.isDrawingMode = isDrawingMode;
    if (isDrawingMode) {
      fabricRef.current.freeDrawingBrush.width = 2;
      fabricRef.current.freeDrawingBrush.color = '#ff0000';
    }
  }, [isDrawingMode]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};