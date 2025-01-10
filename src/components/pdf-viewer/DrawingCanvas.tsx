import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';

interface DrawingCanvasProps {
  width: number;
  height: number;
  currentTool: 'brush' | 'eraser';
  currentColor: string;
  currentSize: number;
  onCanvasReady: (canvas: fabric.Canvas) => void;
}

export const DrawingCanvas = ({
  width,
  height,
  currentTool,
  currentColor,
  currentSize,
  onCanvasReady,
}: DrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        isDrawingMode: true,
        width,
        height,
      });

      fabricCanvasRef.current = canvas;
      onCanvasReady(canvas);

      return () => {
        canvas.dispose();
      };
    }
  }, [width, height, onCanvasReady]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const brush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush = brush;

    if (currentTool === 'brush') {
      brush.color = currentColor;
      brush.width = currentSize;
    } else {
      // For eraser, we'll use white color (or your background color)
      brush.color = '#FFFFFF';
      brush.width = currentSize * 2;
    }
  }, [currentTool, currentColor, currentSize]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 pointer-events-auto touch-none"
    />
  );
};