import { useEffect, useRef } from 'react';
import { fabric } from 'fabric';

interface PDFDrawingCanvasProps {
  isDrawingMode: boolean;
  pageUrl: string;
}

export const PDFDrawingCanvas = ({ isDrawingMode, pageUrl }: PDFDrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: isDrawingMode,
      width: canvasRef.current.offsetWidth,
      height: canvasRef.current.offsetHeight,
    });

    fabricRef.current = canvas;

    // Load the PDF page as background
    fabric.Image.fromURL(pageUrl, (img) => {
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
        scaleX: canvas.width! / img.width!,
        scaleY: canvas.height! / img.height!,
      });
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