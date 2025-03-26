import { useEffect, useState, useRef } from 'react';
import { retrievePdf } from '@/utils/pdfStorage';
import { PDFZoomControls } from '../PDFZoomControls';
import * as pdfjsLib from 'pdfjs-dist';
import '../../styles/scrollbar.css';
import { configurePdfJs, setPdfOptions } from '@/utils/pdfConfig';

// تنظیم کانفیگ pdfjs
configurePdfJs();

interface TutorViewerProps {
  resourceId: string;
  onDrawingComplete?: (imageData: string) => void;
}

export const TutorViewer: React.FC<TutorViewerProps> = ({ resourceId, onDrawingComplete }: TutorViewerProps) => {
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [inputPage, setInputPage] = useState(currentPage.toString());
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawing, setHasDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);
  const [activeDrawingCanvas, setActiveDrawingCanvas] = useState<number | null>(null);
  const [screenshotMode, setScreenshotMode] = useState(false);
  const [screenshotStart, setScreenshotStart] = useState<{ x: number; y: number } | null>(null);
  const [screenshotEnd, setScreenshotEnd] = useState<{ x: number; y: number } | null>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const [pageWidth, setPageWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);

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
          const scale = 1.5;  // Base scale for initial render
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
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(e.target.value);
    const pageNumber = parseInt(e.target.value);
    if (pageNumber && pageNumber > 0 && pageNumber <= pages.length) {
      setCurrentPage(pageNumber);
    }
  };

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= pages.length) {
      setCurrentPage(page);
      setInputPage(page.toString());
    }
  };

  const toggleDrawingMode = () => {
    setDrawingMode(prev => !prev);
  };

  const toggleScreenshotMode = () => {
    setScreenshotMode(prev => !prev);
    if (drawingMode) setDrawingMode(false);
  };

  const getDrawingMousePos = (canvas: HTMLCanvasElement, e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvas.getBoundingClientRect();
    const scrollContainer = canvas.closest('.scroll-area-viewport') || canvas.closest('.overflow-auto');
    const scrollTop = scrollContainer ? scrollContainer.scrollTop : 0;
    const scrollLeft = scrollContainer ? scrollContainer.scrollLeft : 0;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = ((e.clientX - rect.left + scrollLeft) * scaleX) * (100 / zoom);
    const y = ((e.clientY - rect.top + scrollTop) * scaleY) * (100 / zoom);
    
    return { x, y };
  };

  const getScreenshotMousePos = (canvas: HTMLCanvasElement, e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvas.getBoundingClientRect();
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    return { x, y };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>, index: number) => {
    if (!drawingMode) return;
    
    const canvas = canvasRefs.current[index];
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawing(true);
    setActiveDrawingCanvas(index);
    const pos = getDrawingMousePos(canvas, e);
    
    ctx.save();
    ctx.scale(zoom / 100, zoom / 100);
    
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>, index: number) => {
    if (!isDrawing || !drawingMode) return;
    
    const canvas = canvasRefs.current[index];
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const pos = getDrawingMousePos(canvas, e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (activeDrawingCanvas === null || !hasDrawing) return;
    
    const canvas = canvasRefs.current[activeDrawingCanvas];
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.restore();

    if (onDrawingComplete) {
      const combinedCanvas = document.createElement('canvas');
      const combinedCtx = combinedCanvas.getContext('2d');
      if (!combinedCtx) return;

      combinedCanvas.width = canvas.width;
      combinedCanvas.height = canvas.height;

      const img = new Image();
      img.src = pages[activeDrawingCanvas];
      
      img.onload = () => {
        combinedCtx.drawImage(img, 0, 0, combinedCanvas.width, combinedCanvas.height);
        combinedCtx.drawImage(canvas, 0, 0);
        
        const imageData = combinedCanvas.toDataURL('image/png');
        onDrawingComplete(imageData);
        
        ctx.save();
        ctx.scale(zoom / 100, zoom / 100);
        ctx.clearRect(0, 0, canvas.width * (100 / zoom), canvas.height * (100 / zoom));
        ctx.restore();
        
        setHasDrawing(false);
        setActiveDrawingCanvas(null);
      };
    }
  };

  const startScreenshot = (e: React.MouseEvent<HTMLCanvasElement>, index: number) => {
    if (!screenshotMode) return;
    
    const canvas = canvasRefs.current[index];
    if (!canvas) return;
    
    const pos = getScreenshotMousePos(canvas, e);
    setScreenshotStart(pos);
    setScreenshotEnd(pos);
  };

  const updateScreenshot = (e: React.MouseEvent<HTMLCanvasElement>, index: number) => {
    if (!screenshotMode || !screenshotStart) return;
    
    const canvas = canvasRefs.current[index];
    if (!canvas) return;
    
    const pos = getScreenshotMousePos(canvas, e);
    setScreenshotEnd(pos);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const x = Math.min(screenshotStart.x, pos.x);
    const y = Math.min(screenshotStart.y, pos.y);
    const width = Math.abs(pos.x - screenshotStart.x);
    const height = Math.abs(pos.y - screenshotStart.y);
    
    ctx.clearRect(x, y, width, height);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
  };

  const finishScreenshot = (e: React.MouseEvent<HTMLCanvasElement>, index: number) => {
    if (!screenshotMode || !screenshotStart || !screenshotEnd) return;
    
    const canvas = canvasRefs.current[index];
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    
    const x = Math.min(screenshotStart.x, screenshotEnd.x);
    const y = Math.min(screenshotStart.y, screenshotEnd.y);
    const width = Math.abs(screenshotEnd.x - screenshotStart.x);
    const height = Math.abs(screenshotEnd.y - screenshotStart.y);
    
    tempCanvas.width = width;
    tempCanvas.height = height;
    
    const img = new Image();
    img.src = pages[index];
    img.onload = () => {
      const scaleX = img.width / canvas.width;
      const scaleY = img.height / canvas.height;
      
      tempCtx.drawImage(
        img,
        x * scaleX, y * scaleY, width * scaleX, height * scaleY,
        0, 0, width, height
      );
      
      if (onDrawingComplete) {
        const imageData = tempCanvas.toDataURL('image/png');
        onDrawingComplete(imageData);
      }
    };
    
    setScreenshotMode(false);
    setScreenshotStart(null);
    setScreenshotEnd(null);
  };

  const handleScreenshot = () => {
    const canvas = canvasRefs.current[currentPage - 1];
    if (!canvas) return;
    
    const imageData = canvas.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `screenshot-page-${currentPage}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const setupCanvas = () => {
      pages.forEach((_, index) => {
        const canvas = canvasRefs.current[index];
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
      });
    };

    setupCanvas();
    window.addEventListener('resize', setupCanvas);
    
    return () => {
      window.removeEventListener('resize', setupCanvas);
    };
  }, [pages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-black">
        Loading PDF...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <PDFZoomControls
        zoom={zoom}
        currentPage={currentPage}
        totalPages={pages.length}
        inputPage={inputPage}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onPageInputChange={handlePageInputChange}
        onPageChange={handlePageChange}
        drawingMode={drawingMode}
        onToggleDrawing={toggleDrawingMode}
        screenshotMode={screenshotMode}
        onToggleScreenshot={toggleScreenshotMode}
        onScreenshot={handleScreenshot}
      />
      <div 
        className="flex-1 w-full overflow-x-auto overflow-y-auto relative" 
        style={{ 
          '--scrollbar-track': 'none',
          '--scrollbar-thumb': 'rgb(113, 113, 122)',
          '--scrollbar-width': '16px',
          '--scrollbar-height': '16px',
          scrollbarWidth: 'auto',
          scrollbarColor: 'rgb(113, 113, 122) transparent',
          resize: 'none'
        }}>
        <div 
          className="flex flex-col items-center justify-center h-full p-4"
          style={{
            transform: zoom > 100 ? `scale(${zoom / 100})` : 'none',
            transformOrigin: 'center',
            transition: 'transform 0.2s ease-in-out',
            width: zoom > 100 ? `${zoom}%` : '100%'
          }}>
          {pages.length > 0 && (
            <div 
              className="w-full flex justify-center relative rounded-xl overflow-hidden"
              style={{
                width: zoom <= 100 ? `${zoom}%` : '100%',
                maxWidth: '100%',
                transition: 'width 0.2s ease-in-out'
              }}
            >
              <img
                src={pages[currentPage - 1]}
                alt={`Page ${currentPage}`}
                className="max-w-full h-auto select-none rounded-xl"
                style={{ 
                  width: '100%',
                  height: 'auto',
                  pointerEvents: 'none'
                }}
              />
              <canvas
                ref={el => canvasRefs.current[currentPage - 1] = el}
                className="absolute top-0 left-0 w-full h-full rounded-xl"
                style={{ 
                  pointerEvents: (drawingMode || screenshotMode) ? 'auto' : 'none',
                  cursor: drawingMode ? 'crosshair' : (screenshotMode ? 'crosshair' : 'default'),
                  width: '100%',
                  height: '100%'
                }}
                onMouseDown={(e) => {
                  if (drawingMode) startDrawing(e, currentPage - 1);
                  if (screenshotMode) startScreenshot(e, currentPage - 1);
                }}
                onMouseMove={(e) => {
                  if (drawingMode) draw(e, currentPage - 1);
                  if (screenshotMode) updateScreenshot(e, currentPage - 1);
                }}
                onMouseUp={(e) => {
                  if (drawingMode) stopDrawing();
                  if (screenshotMode) finishScreenshot(e, currentPage - 1);
                }}
                onMouseLeave={(e) => {
                  if (drawingMode) stopDrawing();
                  if (screenshotMode) finishScreenshot(e, currentPage - 1);
                }}
              />
            </div>
          )}
        </div>
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
          >
            Previous Slide
          </button>
          <span className="px-4 py-2 bg-muted rounded-lg">
            {currentPage} / {pages.length}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= pages.length}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
          >
            Next Slide
          </button>
        </div>
      </div>
    </div>
  );
};
