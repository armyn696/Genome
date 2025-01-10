import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Image as FabricImage, PencilBrush } from "fabric";

interface PDFDrawingCanvasProps {
  pageUrl: string;
  isDrawingMode: boolean;
  onSelectionComplete?: (selection: string) => void;
}

export const PDFDrawingCanvas = ({ 
  pageUrl, 
  isDrawingMode,
  onSelectionComplete 
}: PDFDrawingCanvasProps) => {
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
        preserveObjectStacking: true,
      });

      // Initialize the drawing brush
      canvas.freeDrawingBrush = new PencilBrush(canvas);
      canvas.freeDrawingBrush.color = '#FF0000';
      canvas.freeDrawingBrush.width = 2;

      // Handle mouse up event
      canvas.on('mouse:up', () => {
        if (isDrawingMode && onSelectionComplete) {
          onSelectionComplete("Selection from PDF");
        }
      });

      // Set the background image directly from the pageUrl
      FabricImage.fromURL(pageUrl, {
        crossOrigin: 'anonymous'
      }).then((imgInstance) => {
        if (!imgInstance) return;
        
        // Calculate and set the scale
        const scale = canvasWidth / img.width;
        imgInstance.scale(scale);
        
        // Set the background image
        canvas.backgroundImage = imgInstance;
        canvas.renderAll();
      });

      setFabricCanvas(canvas);
    };

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
      className="w-full h-full"
    >
      <canvas 
        ref={canvasRef}
        className="max-w-full h-auto shadow-lg rounded-lg"
      />
    </div>
  );
};