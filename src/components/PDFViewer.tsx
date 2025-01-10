import { useEffect, useState } from 'react';
import { retrievePdf } from '@/utils/pdfStorage';
import { ScrollArea } from "@/components/ui/scroll-area";
import * as pdfjsLib from 'pdfjs-dist';

interface PDFViewerProps {
  resourceId: string;
}

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const PDFViewer = ({ resourceId }: PDFViewerProps) => {
  const [pdfPages, setPdfPages] = useState<HTMLCanvasElement[]>([]);
  const [loading, setLoading] = useState(true);

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
        const pages: HTMLCanvasElement[] = [];

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
          
          pages.push(canvas);
        }

        setPdfPages(pages);
        setLoading(false);
      } catch (error) {
        console.error('Error loading PDF:', error);
        setLoading(false);
      }
    };

    loadPdf();
  }, [resourceId]);

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
        {pdfPages.map((canvas, index) => (
          <div 
            key={index}
            className="w-full flex justify-center"
            dangerouslySetInnerHTML={{ 
              __html: canvas.outerHTML 
            }}
          />
        ))}
      </div>
    </ScrollArea>
  );
};