import { useEffect, useState } from 'react';
import { retrievePdf } from '@/utils/pdfStorage';
import { ScrollArea } from "@/components/ui/scroll-area";
import { PDFViewerControls } from './pdf/PDFViewerControls';
import { PDFDrawingCanvas } from './pdf/PDFDrawingCanvas';
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
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDrawingMode, setIsDrawingMode] = useState(false);

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
          const scale = 1.5;
          const viewport = page.getViewport({ scale });
          
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

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
  const handleResetZoom = () => setZoom(100);
  const handlePageChange = (page: number) => setCurrentPage(page);
  const toggleDrawingMode = () => setIsDrawingMode(prev => !prev);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-black">
        Loading PDF...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <PDFViewerControls
        zoom={zoom}
        currentPage={currentPage}
        totalPages={pages.length}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onPageChange={handlePageChange}
        isDrawingMode={isDrawingMode}
        onToggleDrawing={toggleDrawingMode}
      />
      <ScrollArea className="flex-1 relative">
        <div className="flex flex-col items-center gap-4 p-4 min-h-full">
          {pages.map((pageUrl, index) => (
            <div 
              key={index}
              className="w-full flex justify-center"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.2s ease-in-out'
              }}
            >
              <PDFDrawingCanvas 
                pageUrl={pageUrl}
                isDrawingMode={isDrawingMode}
              />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};