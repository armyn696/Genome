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
      isDrawingMode: isDrawingMode,
      width: 800,
      height: 600,
    });

    Image.fromURL(pageUrl, (img) => {
      if (!img) return;
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
        scaleX: canvas.getWidth() / img.width!,
        scaleY: canvas.getHeight() / img.height!,
      });
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

  return <canvas ref={canvasRef} className="w-full h-full" />;
};