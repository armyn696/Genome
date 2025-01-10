import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Image } from "fabric";

interface PDFDrawingCanvasProps {
  pageUrl: string;
  isDrawingMode: boolean;
}

export const PDFDrawingCanvas = ({ pageUrl, isDrawingMode }: PDFDrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadImage = async () => {
      return new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.src = pageUrl;
        img.onload = () => resolve(img);
      });
    };

    const initCanvas = async () => {
      if (!canvasRef.current || !containerRef.current) return;

      // Get container dimensions
      const container = containerRef.current;
      const containerWidth = container.clientWidth;

      // Load and measure the PDF page image
      const img = await loadImage();
      const aspectRatio = img.height / img.width;
      
      // Set canvas dimensions to match the container width and maintain aspect ratio
      const canvasWidth = containerWidth;
      const canvasHeight = containerWidth * aspectRatio;

      // Create or update Fabric canvas
      const canvas = new FabricCanvas(canvasRef.current, {
        width: canvasWidth,
        height: canvasHeight,
        isDrawingMode: isDrawingMode,
      });

      // Set up drawing brush
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = '#FF0000';
        canvas.freeDrawingBrush.width = 2;
      }

      // Set background image
      canvas.setBackgroundImage(pageUrl, canvas.renderAll.bind(canvas), {
        scaleX: canvasWidth / img.width,
        scaleY: canvasHeight / img.height,
      });

      setFabricCanvas(canvas);
    };

    initCanvas();

    return () => {
      if (fabricCanvas) {
        fabricCanvas.dispose();
      }
    };
  }, [pageUrl]);

  // Update drawing mode when isDrawingMode changes
  useEffect(() => {
    if (fabricCanvas) {
      fabricCanvas.isDrawingMode = isDrawingMode;
      fabricCanvas.renderAll();
    }
  }, [isDrawingMode, fabricCanvas]);

  return (
    <div 
      ref={containerRef} 
      className="w-full"
    >
      <canvas 
        ref={canvasRef}
        className="max-w-full h-auto shadow-lg rounded-lg"
      />
    </div>
  );
};