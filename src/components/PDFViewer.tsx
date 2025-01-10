import { useEffect, useState, useRef } from 'react';
import { retrievePdf } from '@/utils/pdfStorage';
import { ScrollArea } from "@/components/ui/scroll-area";
import * as pdfjsLib from 'pdfjs-dist';
import { renderTextLayer } from 'pdfjs-dist/lib/web/text_layer_builder';

interface PDFViewerProps {
  resourceId: string;
}

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).toString();

export const PDFViewer = ({ resourceId }: PDFViewerProps) => {
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);

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
        const viewport = page.getViewport({ scale: 1.5 });

        // Create wrapper div for each page
        const pageWrapper = document.createElement('div');
        pageWrapper.className = 'pdf-page-wrapper mb-4';
        pageWrapper.style.position = 'relative';
        pageWrapper.style.width = `${viewport.width}px`;
        pageWrapper.style.height = `${viewport.height}px`;

        // Create canvas for rendering
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Create text layer div
        const textLayerDiv = document.createElement('div');
        textLayerDiv.className = 'text-layer absolute inset-0';
        textLayerDiv.style.position = 'absolute';
        textLayerDiv.style.left = '0';
        textLayerDiv.style.top = '0';
        textLayerDiv.style.right = '0';
        textLayerDiv.style.bottom = '0';

        pageWrapper.appendChild(canvas);
        pageWrapper.appendChild(textLayerDiv);
        container.appendChild(pageWrapper);

        // Render PDF page
        const renderContext = {
          canvasContext: context!,
          viewport: viewport
        };

        await page.render(renderContext).promise;

        // Get text content and render it
        const textContent = await page.getTextContent();
        textLayerDiv.style.width = `${viewport.width}px`;
        textLayerDiv.style.height = `${viewport.height}px`;
        textLayerDiv.style.transform = `scale(${1.5})`;
        textLayerDiv.style.transformOrigin = '0 0';

        renderTextLayer({
          textContent: textContent,
          container: textLayerDiv,
          viewport: viewport,
          textDivs: []
        });
      }
    };

    renderPages();
  }, [pdfDoc]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-black">
        Loading PDF...
      </div>
    );
  }

  return (
    <ScrollArea className="h-full bg-black">
      <div 
        ref={containerRef}
        className="flex flex-col items-center gap-4 p-4"
      />
    </ScrollArea>
  );
};