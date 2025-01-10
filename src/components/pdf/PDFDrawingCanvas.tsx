import { useEffect, useRef, useState } from 'react';
import { Canvas, Image } from 'fabric';

interface PDFDrawingCanvasProps {
  pageUrl: string;
  isDrawingMode: boolean;
}

export const PDFDrawingCanvas = ({ pageUrl, isDrawingMode }: PDFDrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const initCanvas = () => {
      const fabricCanvas = new Canvas(canvasRef.current, {
        width: 800,
        height: 600,
      });

      // Initialize drawing brush
      fabricCanvas.freeDrawingBrush.width = 2;
      fabricCanvas.freeDrawingBrush.color = '#000000';

      // Load the PDF page as background
      Image.fromURL(pageUrl).then((img) => {
        img.scaleToWidth(fabricCanvas.getWidth()!);
        fabricCanvas.backgroundImage = img;
        fabricCanvas.renderAll();
      });

      setCanvas(fabricCanvas);
    };

    initCanvas();

    return () => {
      canvas?.dispose();
    };
  }, [pageUrl]);

  useEffect(() => {
    if (!canvas) return;
    canvas.isDrawingMode = isDrawingMode;
  }, [isDrawingMode, canvas]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};