import { useEffect, useState, useRef } from 'react';
import { retrievePdf } from '@/utils/pdfStorage';
import { ScrollArea } from "@/components/ui/scroll-area";
import { PDFViewerControls } from './pdf/PDFViewerControls';
import * as pdfjsLib from 'pdfjs-dist';
import { TextLayerBuilder } from 'pdfjs-dist/web/pdf_viewer.mjs';
import 'pdfjs-dist/web/pdf_viewer.css';

interface PDFViewerProps {
  resourceId: string;
}

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).toString();

export const PDFViewer = ({ resourceId }: PDFViewerProps) => {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

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
        setPdfDoc(pdf);
        setLoading(false);
      } catch (error) {
        console.error('Error loading PDF:', error);
        setLoading(false);
      }
    };

    loadPdf();
  }, [resourceId]);

  useEffect(() => {
    if (!pdfDoc || !containerRef.current) return;

    const renderPages = async () => {
      const container = containerRef.current;
      if (!container) return;

      // Clear previous content
      container.innerHTML = '';

      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const scale = zoom / 100;
        const viewport = page.getViewport({ scale: scale * 1.5 });

        // Create wrapper div for each page
        const pageWrapper = document.createElement('div');
        pageWrapper.className = 'relative mb-4 mx-auto';
        pageWrapper.style.width = `${viewport.width}px`;
        pageWrapper.style.height = `${viewport.height}px`;

        // Create canvas for rendering
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // Create text layer div
        const textLayerDiv = document.createElement('div');
        textLayerDiv.className = 'absolute top-0 left-0 right-0 bottom-0 textLayer';

        pageWrapper.appendChild(canvas);
        pageWrapper.appendChild(textLayerDiv);
        container.appendChild(pageWrapper);

        // Render PDF page
        const renderContext = {
          canvasContext: context!,
          viewport: viewport
        };

        await page.render(renderContext).promise;

        // Get text content and render text layer
        const textContent = await page.getTextContent();
        
        const textLayer = new TextLayerBuilder({
          textContent: textContent,
          container: textLayerDiv,
          viewport: viewport,
          pageIndex: page.pageNumber - 1
        });
        
        textLayer.render();
      }
    };

    renderPages();
  }, [pdfDoc, zoom]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
  const handleResetZoom = () => setZoom(100);
  const handlePageChange = (page: number) => setCurrentPage(page);

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
        totalPages={pdfDoc?.numPages || 0}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onPageChange={handlePageChange}
      />
      <ScrollArea className="flex-1">
        <div 
          ref={containerRef}
          className="flex flex-col items-center p-4"
          style={{
            minHeight: '100%'
          }}
        />
      </ScrollArea>
      <style>{`
        .textLayer {
          position: absolute;
          text-align: initial;
          left: 0;
          top: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          opacity: 0.2;
          line-height: 1.0;
        }
        
        .textLayer > span {
          color: transparent;
          position: absolute;
          white-space: pre;
          cursor: text;
          transform-origin: 0% 0%;
        }

        .textLayer .highlight {
          margin: -1px;
          padding: 1px;
          background-color: rgb(180, 0, 170);
          border-radius: 4px;
        }

        .textLayer .highlight.selected {
          background-color: rgb(0, 100, 0);
        }

        .textLayer ::selection { 
          background: rgb(0, 0, 255);
          color: transparent;
        }
      `}</style>
    </div>
  );
};