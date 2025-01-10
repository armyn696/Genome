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
  const lastPathRef = useRef<any>(null);

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

      // Set up drawing brush
      canvas.freeDrawingBrush = new PencilBrush(canvas);
      canvas.freeDrawingBrush.color = '#FF0000';
      canvas.freeDrawingBrush.width = 2;

      // Handle mouse up event
      canvas.on('mouse:up', () => {
        if (isDrawingMode && lastPathRef.current) {
          // Get the path that was just drawn
          const path = lastPathRef.current;
          
          // If there's a selection handler, call it
          if (onSelectionComplete) {
            onSelectionComplete("Selection from PDF");
          }

          // Remove the path after a short delay
          setTimeout(() => {
            canvas.remove(path);
            canvas.renderAll();
          }, 100);

          // Clear the last path reference
          lastPathRef.current = null;
        }
      });

      // Track the last path that was drawn
      canvas.on('path:created', (e: any) => {
        lastPathRef.current = e.path;
      });

      // Load and set background image
      FabricImage.fromURL(pageUrl, {
        crossOrigin: 'anonymous'
      }).then((imgInstance) => {
        if (!imgInstance) return;
        
        // Calculate and set the scale
        const scale = canvasWidth / img.width;
        imgInstance.scaleX = scale;
        imgInstance.scaleY = scale;
        
        // Set the background image using the new API
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