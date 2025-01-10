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
    // Initialize canvas contexts after pages are loaded
    canvasRefs.current = new Array(pages.length).fill(null);
    contextRefs.current = new Array(pages.length).fill(null);
  }, [pages]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>, index: number) => {
    const context = contextRefs.current[index];
    if (!context) return;

    setIsDrawing(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    context.beginPath();
    context.moveTo(x, y);
    context.strokeStyle = 'red';
    context.lineWidth = 2;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>, index: number) => {
    if (!isDrawing) return;
    
    const context = contextRefs.current[index];
    if (!context) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
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
            />
            <canvas
              ref={el => {
                if (el) {
                  canvasRefs.current[index] = el;
                  const context = el.getContext('2d');
                  if (context) {
                    contextRefs.current[index] = context;
                    // Set canvas size to match image
                    const img = new Image();
                    img.onload = () => {
                      el.width = img.width;
                      el.height = img.height;
                    };
                    img.src = pageUrl;
                  }
                }
              }}
              className="max-w-full h-auto cursor-crosshair"
              onMouseDown={(e) => startDrawing(e, index)}
              onMouseMove={(e) => draw(e, index)}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};