import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas } from "fabric";

interface PDFDrawingCanvasProps {
  pageUrl: string;
  isDrawingMode: boolean;
}

export const PDFDrawingCanvas = ({ pageUrl, isDrawingMode }: PDFDrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initCanvas = async () => {
      if (!canvasRef.current || !containerRef.current) return;

      // Get container dimensions
      const container = containerRef.current;
      const containerWidth = container.clientWidth;

      // Create a temporary image to get dimensions
      const img = new Image();
      img.src = pageUrl;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Calculate canvas dimensions
      const aspectRatio = img.height / img.width;
      const canvasWidth = containerWidth;
      const canvasHeight = containerWidth * aspectRatio;

      // Create new canvas instance
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
      canvas.setBackgroundColor('white', canvas.renderAll.bind(canvas));
      
      // Load and set background image
      fabric.Image.fromURL(pageUrl, (imgInstance) => {
        if (!imgInstance) return;
        
        canvas.backgroundImage = imgInstance;
        imgInstance.scaleX = canvasWidth / (imgInstance.width ?? 1);
        imgInstance.scaleY = canvasHeight / (imgInstance.height ?? 1);
        canvas.renderAll();
      });

      setFabricCanvas(canvas);
    };

    // Initialize canvas
    initCanvas();

    // Cleanup
    return () => {
      if (fabricCanvas) {
        fabricCanvas.dispose();
      }
    };
  }, [pageUrl]);

  // Update drawing mode when isDrawingMode changes
  useEffect(() => {
    if (!fabricCanvas) return;
    
    fabricCanvas.isDrawingMode = isDrawingMode;
    if (fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = '#FF0000';
      fabricCanvas.freeDrawingBrush.width = 2;
    }
    fabricCanvas.renderAll();
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