import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Image as FabricImage, PencilBrush } from "fabric";

interface PDFDrawingCanvasProps {
  pageUrl: string;
  isDrawingMode: boolean;
  onSelectionComplete?: (selection: string) => void;
  setMessage?: (message: string) => void;
}

export const PDFDrawingCanvas = ({ 
  pageUrl, 
  isDrawingMode,
  onSelectionComplete,
  setMessage 
}: PDFDrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPathRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Get container dimensions
    const container = containerRef.current;
    const containerWidth = container.clientWidth;

    // Create a temporary image to get dimensions
    const img = new Image();
    img.src = pageUrl;
    
    const initCanvas = async () => {
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
      canvas.freeDrawingBrush = new PencilBrush(canvas);
      canvas.freeDrawingBrush.color = '#FF0000';
      canvas.freeDrawingBrush.width = 2;

      // Handle mouse up event
      const handleMouseUp = () => {
        if (isDrawingMode && lastPathRef.current && setMessage) {
          // Capture the entire canvas with both the PDF and drawing
          const dataUrl = canvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 1,
            enableRetinaScaling: false
          });
          
          // Add the image to the draft message
          setMessage(prev => prev + `\n[Drawn Image: ${dataUrl}]`);
          
          // Remove the path immediately after capturing
          canvas.remove(lastPathRef.current);
          canvas.renderAll();
          lastPathRef.current = null;
        }
      };

      // Track the last path that was drawn
      const handlePathCreated = (e: any) => {
        lastPathRef.current = e.path;
      };

      canvas.on('mouse:up', handleMouseUp);
      canvas.on('path:created', handlePathCreated);

      // Set background color
      canvas.backgroundColor = 'white';
      canvas.renderAll();
      
      // Load and set background image
      FabricImage.fromURL(pageUrl, {
        crossOrigin: 'anonymous',
      }).then((imgInstance) => {
        if (!imgInstance || !canvas) return;
        
        // Calculate and set the scale
        const scale = canvasWidth / img.width;
        imgInstance.scaleX = scale;
        imgInstance.scaleY = scale;
        
        canvas.backgroundImage = imgInstance;
        canvas.renderAll();
      });

      setFabricCanvas(canvas);

      // Return cleanup function
      return () => {
        canvas.off('mouse:up', handleMouseUp);
        canvas.off('path:created', handlePathCreated);
        canvas.dispose();
        setFabricCanvas(null);
      };
    };

    // Initialize canvas and store cleanup function
    const cleanup = initCanvas();

    // Cleanup function for useEffect
    return () => {
      cleanup.then(cleanupFn => cleanupFn?.());
    };
  }, [pageUrl, isDrawingMode, setMessage]); 

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