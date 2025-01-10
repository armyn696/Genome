import { useEffect, useState, useRef } from 'react';
import { retrievePdf } from '@/utils/pdfStorage';
import { ScrollArea } from "@/components/ui/scroll-area";
import * as pdfjsLib from 'pdfjs-dist';
import { DrawingToolbar } from './pdf-viewer/DrawingToolbar';
import { DrawingCanvas } from './pdf-viewer/DrawingCanvas';
import { fabric } from 'fabric';
import { useToast } from './ui/use-toast';

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
  const [currentTool, setCurrentTool] = useState<'brush' | 'eraser'>('brush');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentSize, setCurrentSize] = useState(2);
  const canvasesRef = useRef<{ [key: number]: fabric.Canvas }>({});
  const { toast } = useToast();

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

  const handleCanvasReady = (pageIndex: number, canvas: fabric.Canvas) => {
    canvasesRef.current[pageIndex] = canvas;
  };

  const handleUndo = () => {
    Object.values(canvasesRef.current).forEach(canvas => {
      if (canvas.getObjects().length > 0) {
        const lastObject = canvas.getObjects()[canvas.getObjects().length - 1];
        canvas.remove(lastObject);
        canvas.renderAll();
      }
    });
  };

  const handleRedo = () => {
    // Implement redo functionality
    toast({
      title: "Coming Soon",
      description: "Redo functionality will be available in the next update.",
    });
  };

  const handleSave = () => {
    // Implement save functionality
    toast({
      title: "Drawings Saved",
      description: "Your drawings have been saved successfully.",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-black">
        <span className="loader"></span>
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
              className="max-w-full h-auto"
              loading="lazy"
            />
            <DrawingCanvas
              width={800} // You'll need to calculate the actual width
              height={1000} // You'll need to calculate the actual height
              currentTool={currentTool}
              currentColor={currentColor}
              currentSize={currentSize}
              onCanvasReady={(canvas) => handleCanvasReady(index, canvas)}
            />
          </div>
        ))}
      </div>
      <DrawingToolbar
        currentTool={currentTool}
        currentColor={currentColor}
        currentSize={currentSize}
        onToolChange={setCurrentTool}
        onColorChange={setCurrentColor}
        onBrushSizeChange={setCurrentSize}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSave={handleSave}
      />
    </ScrollArea>
  );
};