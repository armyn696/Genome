import { useEffect, useState, useRef } from 'react';
import { retrievePdf } from '@/utils/pdfStorage';
import { ScrollArea } from "@/components/ui/scroll-area";
import * as pdfjsLib from 'pdfjs-dist';

interface PDFViewerProps {
  resourceId: string;
}

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).toString();

export const PDFViewer = ({ resourceId }: PDFViewerProps) => {
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const contextRefs = useRef<(CanvasRenderingContext2D | null)[]>([]);
  const lastPosRefs = useRef<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        setLoading(true);
        const pdfUrl = await retrievePdf(resourceId);
        
        if (!pdfUrl) {
          console.error('PDF URL not found');
          return;
        }

        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        const pagesArray: string[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (!context) continue;
          
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;
          
          pagesArray.push(canvas.toDataURL());
        }

        setPages(pagesArray);
        setLoading(false);
      } catch (error) {
        console.error('Error loading PDF:', error);
        setLoading(false);
      }
    };

    loadPdf();
  }, [resourceId]);

  useEffect(() => {
    canvasRefs.current = new Array(pages.length).fill(null);
    contextRefs.current = new Array(pages.length).fill(null);
    lastPosRefs.current = new Array(pages.length).fill({ x: 0, y: 0 });
  }, [pages]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>, index: number) => {
    e.preventDefault();
    const canvas = canvasRefs.current[index];
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    lastPosRefs.current[index] = { x, y };

    const context = canvas.getContext('2d');
    if (context) {
      contextRefs.current[index] = context;
      context.beginPath();
      context.moveTo(x, y);
      context.strokeStyle = 'red';
      context.lineWidth = 2;
      context.lineCap = 'round';
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>, index: number) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRefs.current[index];
    const context = contextRefs.current[index];
    if (!canvas || !context) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const lastPos = lastPosRefs.current[index];
    
    context.beginPath();
    context.moveTo(lastPos.x, lastPos.y);
    context.lineTo(x, y);
    context.stroke();

    lastPosRefs.current[index] = { x, y };
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-black">
        Loading PDF...
      </div>
    );
  }

  return (
    <ScrollArea className="h-full bg-black">
      <div className="flex flex-col items-center gap-4 p-4">
        {pages.map((pageUrl, index) => (
          <div 
            key={index}
            className="w-full flex justify-center relative"
          >
            <img 
              src={pageUrl} 
              alt={`Page ${index + 1}`}
              className="max-w-full h-auto absolute"
              loading="lazy"
              draggable="false"
            />
            <canvas
              ref={el => {
                if (el) {
                  canvasRefs.current[index] = el;
                  const img = new Image();
                  img.onload = () => {
                    el.width = img.width;
                    el.height = img.height;
                  };
                  img.src = pageUrl;
                }
              }}
              className="max-w-full h-auto cursor-crosshair"
              onMouseDown={(e) => startDrawing(e, index)}
              onMouseMove={(e) => draw(e, index)}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              style={{ touchAction: 'none', pointerEvents: 'auto' }}
            />
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};