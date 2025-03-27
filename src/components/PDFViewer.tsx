import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { retrievePdf, storePdf } from '@/utils/pdfStorage';
import { useToast } from '@/components/ui/use-toast';
import { PDFZoomControls } from './PDFZoomControls';
import { Button } from '@/components/ui/button';
import { Upload, Highlighter as HighlighterIcon, Wand as WandIcon, Image as ImageIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { configurePdfJs, setPdfOptions } from '@/utils/pdfConfig';
import { v4 as uuidv4 } from 'uuid'; // برای ID منحصر به فرد هایلایت‌ها

// تنظیم کانفیگ pdfjs
configurePdfJs();

interface PDFViewerProps {
  resourceId: string;
  displayName: string;
  fileName?: string;
  onDrawingComplete?: (imageData: string) => void;
  onScreenshot?: (screenshotData: string) => void;
}

interface Line {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

// اینترفیس برای ذخیره اطلاعات مستطیل هایلایت (نرمال شده نسبت به scale)
interface HighlightRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// اینترفیس برای ذخیره اطلاعات یک هایلایت
interface Highlight {
  id: string;
  pageIndex: number; // 0-based index
  rects: HighlightRect[];
  text: string; // متن هایلایت شده
  color?: string; // رنگ هایلایت (اختیاری)
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  resourceId,
  displayName,
  fileName,
  onDrawingComplete,
  onScreenshot,
}) => {
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [inputPage, setInputPage] = useState<string>('1');
  const [scale, setScale] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pageViewable, setPageViewable] = useState<boolean>(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [pageVisibilityRatio] = useState<Map<number, number>>(new Map());

  // متغیرهای state برای حالت‌های مختلف
  const [drawingMode, setDrawingMode] = useState<boolean>(false);
  const [highlightMode, setHighlightMode] = useState<boolean>(false);
  const [screenshotMode, setScreenshotMode] = useState<boolean>(false);
  const [screenshotStart, setScreenshotStart] = useState<{ x: number; y: number; pageIndex: number } | null>(null);
  const [screenshotEnd, setScreenshotEnd] = useState<{ x: number; y: number; pageIndex: number } | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const outerContainerRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const linesRef = useRef<Line[][]>([]);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // تابع برای فعال کردن انتخاب متن
  const enableTextSelection = () => {
    console.log('Enabling text selection on all pages');

    const textLayers = document.querySelectorAll('.react-pdf__Page__textContent');
    textLayers.forEach((textLayer, index) => {
      if (textLayer) {
        (textLayer as HTMLElement).style.userSelect = 'text';
        (textLayer as HTMLElement).style.pointerEvents = 'auto';
        (textLayer as HTMLElement).style.zIndex = '40';

        console.log(`Enabled text selection for text layer ${index + 1} using DOM directly`);
      }
    });
  };

  // تابع برای toggle کردن حالت رسم
  const toggleDrawingMode = () => {
    console.log('Toggle drawing mode requested');
    // منطق جدید: فقط یک حالت فعال است
    const newMode = !drawingMode;
    
    if (newMode) {
      // غیرفعال کردن دیگر حالت‌ها
      setHighlightMode(false);
      setScreenshotMode(false);
      
      // آماده‌سازی کانواس‌ها برای رسم
      setTimeout(() => {
        prepareCanvasesForDrawing();
      }, 50);
    }
    
    setDrawingMode(newMode);
    console.log(`Drawing mode is now: ${newMode}`);
  };
  
  // تابع برای toggle کردن حالت هایلایت
  const toggleHighlightMode = () => {
    console.log('Toggle highlight mode requested');
    // منطق جدید: فقط یک حالت فعال است
    const newMode = !highlightMode;
    
    if (newMode) {
      // غیرفعال کردن دیگر حالت‌ها
      setDrawingMode(false);
      setScreenshotMode(false);
      
      // فعال کردن انتخاب متن
      enableTextSelection();
    }
    
    setHighlightMode(newMode);
    console.log(`Highlight mode is now: ${newMode}`);
  };
  
  // تابع برای toggle کردن حالت اسکرین‌شات
  const toggleScreenshotMode = () => {
    // اگر در حال خروج از حالت اسکرین‌شات هستیم، مطمئن شویم که هیچ ناحیه انتخاب شده‌ای باقی نمی‌ماند
    if (screenshotMode) {
      setScreenshotStart(null);
      setScreenshotEnd(null);
    }
    
    setScreenshotMode(!screenshotMode);
    
    // غیرفعال کردن سایر حالت‌ها
    if (!screenshotMode) {
      setDrawingMode(false);
      setHighlightMode(false);
    }
  };

  // تابع برای آماده‌سازی کانواس‌ها برای رسم
  const prepareCanvasesForDrawing = () => {
    console.log('Preparing canvases for drawing');
    
    // اطمینان از اینکه همه کانواس‌ها برای رسم آماده هستند
    document.querySelectorAll('.drawing-canvas').forEach((canvas: Element, index) => {
      if (canvas instanceof HTMLCanvasElement) {
        const pageElement = document.querySelector(`#page_wrapper_${index + 1} .react-pdf__Page`);
        if (!pageElement) return;
        
        const rect = pageElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        // تنظیم سبک کانواس
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.strokeStyle = '#ff0000';
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          
          // پاک کردن کانواس برای اطمینان
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        console.log(`Canvas ${index + 1} prepared for drawing: ${canvas.width}x${canvas.height}`);
      }
    });
    
    // فعال کردن pointer-events برای کانواس‌ها
    document.querySelectorAll('.drawing-canvas').forEach((canvas: Element) => {
      (canvas as HTMLElement).style.pointerEvents = 'auto';
      (canvas as HTMLElement).style.zIndex = '30';
    });
  };

  // تابع برای تنظیم کانواس‌ها
  const setupCanvases = () => {
    console.log('Setting up canvases for all pages');
    setTimeout(() => {
      document.querySelectorAll('.drawing-canvas').forEach((canvas: Element, index) => {
        if (canvas instanceof HTMLCanvasElement) {
          const pageElement = document.querySelector(`#page_wrapper_${index + 1} .react-pdf__Page`);
          if (!pageElement) return;

          const rect = pageElement.getBoundingClientRect();
          canvas.width = rect.width;
          canvas.height = rect.height;

          console.log(`Canvas ${index + 1} setup: ${canvas.width}x${canvas.height}`);
        }
      });
    }, 200);
  };

  // هندلر رویدادهای رسم
  const handleDrawingStart = (e: React.MouseEvent<HTMLCanvasElement>, pageIndex: number) => {
    if (!drawingMode) {
      console.log('Drawing mode is OFF');
      return;
    }

    console.log(`Starting to draw on page ${pageIndex + 1}, drawing mode: ${drawingMode}`);

    const canvas = canvasRefs.current[pageIndex];
    if (!canvas) {
      console.error(`Canvas ref for page ${pageIndex + 1} is null`);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get canvas context');
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;

    // تنظیمات رسم
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    let lastX = startX;
    let lastY = startY;

    // آرایه برای ذخیره نقاط
    const points: { x: number; y: number }[] = [{ x: startX, y: startY }];

    const handleMove = (moveEvent: MouseEvent) => {
      const currentX = moveEvent.clientX - rect.left;
      const currentY = moveEvent.clientY - rect.top;

      // رسم خط
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(currentX, currentY);
      ctx.stroke();

      // ذخیره نقطه جدید
      points.push({ x: currentX, y: currentY });

      // بروزرسانی آخرین نقطه
      lastX = currentX;
      lastY = currentY;
    };

    const handleEnd = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);

      // ذخیره خطوط
      if (points.length > 1) {
        if (!linesRef.current[pageIndex]) {
          linesRef.current[pageIndex] = [];
        }

        for (let i = 1; i < points.length; i++) {
          const line: Line = {
            startX: points[i - 1].x,
            startY: points[i - 1].y,
            endX: points[i].x,
            endY: points[i].y,
          };

          linesRef.current[pageIndex].push(line);
        }

        console.log(`Saved ${points.length - 1} line segments for page ${pageIndex + 1}`);

        // گرفتن اسکرین‌شات از صفحه با نقاشی
        capturePageWithDrawing(pageIndex).then((imageData) => {
          // ارسال تصویر به چت
          if (onDrawingComplete) {
            onDrawingComplete(imageData);
          }

          // پاک کردن نقاشی
          setTimeout(() => {
            clearDrawingOnPage(pageIndex);
          }, 200);
        });
      }
    };

    // اضافه کردن event listeners
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
  };

  // تابع برای گرفتن اسکرین‌شات از صفحه با نقاشی
  const capturePageWithDrawing = async (pageIndex: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        // پیدا کردن المان صفحه
        const pageWrapper = document.querySelector(`#page_wrapper_${pageIndex + 1}`);
        if (!pageWrapper) {
          console.error('PDF page wrapper not found for screenshot');
          reject('PDF page wrapper not found');
          return;
        }

        // استفاده از html2canvas برای گرفتن اسکرین‌شات
        import('html2canvas').then(({ default: html2canvas }) => {
          html2canvas(pageWrapper as HTMLElement, {
            scale: 2,
            logging: true,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
            foreignObjectRendering: false,
            removeContainer: false,
            onclone: (clonedDoc, element) => {
              console.log('Cloning document for screenshot');

              // اطمینان از کپی شدن نقاشی
              const canvas = canvasRefs.current[pageIndex];
              const clonedCanvas = clonedDoc.querySelector(`#drawing_canvas_${pageIndex}`);

              if (canvas && clonedCanvas) {
                const ctx = (clonedCanvas as HTMLCanvasElement).getContext('2d');
                if (ctx) {
                  ctx.drawImage(canvas, 0, 0);
                  console.log('Drawing copied to cloned canvas');
                }
              }

              // اطمینان از نمایش هایلایت‌ها
              const highlights = document.querySelectorAll('.highlight-rect');
              highlights.forEach((highlight) => {
                const clonedHighlight = clonedDoc.querySelector(`[data-highlight-id="${highlight.getAttribute('data-highlight-id')}"]`);
                if (clonedHighlight) {
                  (clonedHighlight as HTMLElement).style.opacity = '1';
                  (clonedHighlight as HTMLElement).style.display = 'block';
                  (clonedHighlight as HTMLElement).style.visibility = 'visible';
                  console.log('Highlight visibility ensured');
                }
              });
            },
          }).then((canvas) => {
            // تبدیل به تصویر
            const imageData = canvas.toDataURL('image/png');
            console.log('Captured page with drawing');
            resolve(imageData);
          }).catch((err) => {
            console.error('Error taking screenshot:', err);
            reject(err);
          });
        });
      } catch (error) {
        console.error('Error in capturePageWithDrawing:', error);
        reject(error);
      }
    });
  };

  // تابع برای پاک کردن نقاشی از صفحه
  const clearDrawingOnPage = (pageIndex: number) => {
    // پاک کردن آرایه خطوط
    if (linesRef.current[pageIndex]) {
      linesRef.current[pageIndex] = [];
    }

    // پاک کردن کنواس
    const canvas = canvasRefs.current[pageIndex];
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        console.log(`Cleared drawing on page ${pageIndex + 1}`);
      }
    }
  };

  useEffect(() => {
    if (numPages && containerRef.current) {
      setupCanvases();
    }
  }, [numPages, containerRef, scale]);

  useEffect(() => {
    const loadPdf = async () => {
      if (resourceId && displayName) {
        setIsLoading(true);
        try {
          const url = await retrievePdf(resourceId, displayName);
          if (url) {
            setPdfUrl(url);
          } else {
            setLoadError(new Error('فایل PDF یافت نشد.'));
          }
        } catch (error) {
          console.error('Error loading PDF:', error);
          setLoadError(error instanceof Error ? error : new Error('خطا در بارگذاری PDF'));
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadPdf();
  }, [resourceId, displayName]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        if (width > 0) {
          setContainerSize({ width, height });
        }
      }
    };

    handleResize();

    const debouncedResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(() => {
        handleResize();
      }, 100); // debounce برای عملکرد روان
    };

    const resizeObserver = new ResizeObserver(debouncedResize);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    if (outerContainerRef.current) resizeObserver.observe(outerContainerRef.current);
    if (containerRef.current?.parentElement) resizeObserver.observe(containerRef.current.parentElement);
    if (outerContainerRef.current?.parentElement) resizeObserver.observe(outerContainerRef.current.parentElement);
    resizeObserver.observe(document.body);

    document.addEventListener('mousemove', debouncedResize);
    document.addEventListener('mouseup', handleResize);
    window.addEventListener('resize', debouncedResize);

    return () => {
      resizeObserver.disconnect();
      document.removeEventListener('mousemove', debouncedResize);
      document.removeEventListener('mouseup', handleResize);
      window.removeEventListener('resize', debouncedResize);
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (numPages > 0) {
      canvasRefs.current = Array(numPages).fill(null);
      linesRef.current = Array(numPages).fill(null).map(() => []); // مقداردهی اولیه برای هر صفحه
    }
  }, [numPages]);

  // مدیریت رویدادهای اسکرین‌شات
  const startScreenshot = (e: React.MouseEvent<HTMLCanvasElement | HTMLDivElement>) => {
    if (!screenshotMode) return;

    // تعیین صفحه PDF از روی المان کلیک شده
    const target = e.target as HTMLElement;
    const canvas = target.closest('.canvas-layer') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Screenshot target canvas not found');
      return;
    }

    // تعیین شماره صفحه
    let pageIndex = -1;
    for (let i = 0; i < canvasRefs.current.length; i++) {
      if (canvasRefs.current[i] === canvas) {
        pageIndex = i;
        break;
      }
    }

    if (pageIndex === -1) {
      console.error('Could not determine page index for screenshot');
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setScreenshotStart({ x, y, pageIndex });
    setScreenshotEnd({ x, y, pageIndex });

    console.log(`Started screenshot on page ${pageIndex + 1} at (${x}, ${y})`);
  };

  const updateScreenshot = (e: React.MouseEvent<HTMLCanvasElement | HTMLDivElement>) => {
    if (!screenshotMode || !screenshotStart) return;

    const pageIndex = screenshotStart.pageIndex;
    const canvas = canvasRefs.current[pageIndex];
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setScreenshotEnd({ x, y, pageIndex });
  };

  const finishScreenshot = (e: React.MouseEvent<HTMLCanvasElement | HTMLDivElement>) => {
    if (!screenshotMode || !screenshotStart || !screenshotEnd) return;

    // اطمینان از اینکه شروع و پایان در صفحه یکسان هستند
    if (screenshotStart.pageIndex !== screenshotEnd.pageIndex) {
      setScreenshotStart(null);
      setScreenshotEnd(null);
      return;
    }

    const pageIndex = screenshotStart.pageIndex;
    const canvas = canvasRefs.current[pageIndex];
    if (!canvas) return;

    // محاسبه مستطیل برای برش
    const startX = Math.min(screenshotStart.x, screenshotEnd.x);
    const startY = Math.min(screenshotStart.y, screenshotEnd.y);
    const width = Math.abs(screenshotEnd.x - screenshotStart.x);
    const height = Math.abs(screenshotEnd.y - screenshotStart.y);

    // حداقل اندازه برای اسکرین‌شات
    if (width < 10 || height < 10) {
      console.log('Screenshot too small, ignoring');
      setScreenshotStart(null);
      setScreenshotEnd(null);
      return;
    }

    // گرفتن صفحه PDF مربوطه
    const pdfPage = document.querySelector(`#page_wrapper_${pageIndex + 1} .react-pdf__Page`);
    if (!pdfPage) {
      console.error('PDF page not found for screenshot');
      setScreenshotStart(null);
      setScreenshotEnd(null);
      return;
    }

    // استفاده از html2canvas برای گرفتن اسکرین‌شات
    import('html2canvas').then(({ default: html2canvas }) => {
      // به جای استفاده مستقیم از pdfPage، کل کانتینر صفحه را که شامل هایلایت‌ها هم هست انتخاب می‌کنیم
      const pageWithHighlights = pdfPage?.closest('.pdf-page-container') || pdfPage;
      
      // قبل از اسکرین‌شات، لایه خاکستری را موقتاً پنهان می‌کنیم
      const screenshotOverlay = document.querySelector('.screenshot-overlay');
      const screenshotBackground = document.querySelector('.screenshot-background');
      if (screenshotOverlay) {
        (screenshotOverlay as HTMLElement).style.display = 'none';
      }
      if (screenshotBackground) {
        (screenshotBackground as HTMLElement).style.display = 'none';
      }
      
      html2canvas(pageWithHighlights as HTMLElement, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff', // پس‌زمینه سفید برای وضوح بیشتر
        ignoreElements: (element) => {
          // حذف المان‌های اضافی و لایه خاکستری
          return element.classList.contains('drawing-tools') || 
                 element.classList.contains('screenshot-overlay') ||
                 element.classList.contains('screenshot-background');
        },
        onclone: (documentClone, element) => {
          // پنهان کردن overlay خاکستری در نسخه کلون
          const overlay = documentClone.querySelector('.screenshot-overlay');
          if (overlay) {
            (overlay as HTMLElement).style.display = 'none';
          }
          
          // پنهان کردن هر گونه لایه خاکستری
          const grayOverlays = documentClone.querySelectorAll('.screenshot-background');
          grayOverlays.forEach(overlay => {
            (overlay as HTMLElement).style.display = 'none';
          });
          
          // اطمینان از نمایش هایلایت‌ها در نسخه کلون شده
          const highlights = documentClone.querySelectorAll('.pdf-highlight');
          highlights.forEach(highlight => {
            // اطمینان از اینکه هایلایت‌ها قابل رؤیت هستند
            (highlight as HTMLElement).style.opacity = '1';
            (highlight as HTMLElement).style.visibility = 'visible';
            (highlight as HTMLElement).style.display = 'block';
          });
          return documentClone;
        }
      }).then((canvas) => {
        // برگرداندن لایه‌ها به حالت قبلی
        if (screenshotOverlay) {
          (screenshotOverlay as HTMLElement).style.display = 'block';
        }
        if (screenshotBackground) {
          (screenshotBackground as HTMLElement).style.display = 'block';
        }
        
        // برش قسمت مورد نظر
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = width * 2; // استفاده از scale=2 در html2canvas
        croppedCanvas.height = height * 2; // استفاده از scale=2 در html2canvas

        const croppedCtx = croppedCanvas.getContext('2d');
        if (!croppedCtx) return;

        croppedCtx.drawImage(
          canvas,
          startX * 2,
          startY * 2,
          width * 2,
          height * 2, // استفاده از scale=2 در html2canvas
          0,
          0,
          width * 2,
          height * 2
        );

        // تبدیل به تصویر
        const screenshotImage = croppedCanvas.toDataURL('image/png');

        if (onScreenshot) {
          onScreenshot(screenshotImage);
        }

        console.log('Screenshot taken successfully');

        // پاک کردن وضعیت انتخاب
        setScreenshotStart(null);
        setScreenshotEnd(null);
        setScreenshotMode(false); // خروج خودکار از حالت اسکرین‌شات
      }).catch((err) => {
        console.error('Error taking screenshot:', err);
        setScreenshotStart(null);
        setScreenshotEnd(null);
        setScreenshotMode(false); // خروج خودکار از حالت اسکرین‌شات در صورت خطا
      });
    });
  };

  // کامپوننت برای نمایش ناحیه اسکرین‌شات
  const ScreenshotOverlay = () => {
    if (!screenshotMode || !screenshotStart || !screenshotEnd) return null;
    
    // فقط در صفحه‌ای که اسکرین‌شات شروع شده نمایش داده شود
    if (screenshotStart.pageIndex !== currentPage - 1) return null;

    const left = Math.min(screenshotStart.x, screenshotEnd.x);
    const top = Math.min(screenshotStart.y, screenshotEnd.y);
    const width = Math.abs(screenshotEnd.x - screenshotStart.x);
    const height = Math.abs(screenshotEnd.y - screenshotStart.y);

    return (
      <div
        style={{
          position: 'absolute',
          left: `${left}px`,
          top: `${top}px`,
          width: `${width}px`,
          height: `${height}px`,
          border: '2px dashed white',
          backgroundColor: 'transparent',
          pointerEvents: 'none',
          zIndex: 50,
        }}
      />
    );
  };

  // کامپوننت برای نمایش پس‌زمینه نیمه‌شفاف در حالت اسکرین‌شات
  const ScreenshotBackground = () => {
    if (!screenshotMode) return null;

    // اگر هنوز ناحیه‌ای انتخاب نشده، کل صفحه را تیره می‌کنیم
    if (!screenshotStart || !screenshotEnd) {
      return (
        <div
          className="screenshot-background"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            pointerEvents: 'none',
            zIndex: 40,
          }}
        />
      );
    }

    // اگر انتخاب در صفحه فعلی نیست، فقط کل صفحه را تیره می‌کنیم
    if (screenshotStart.pageIndex !== currentPage - 1) {
      return (
        <div
          className="screenshot-background"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            pointerEvents: 'none',
            zIndex: 40,
          }}
        />
      );
    }

    // محاسبه ابعاد مستطیل انتخاب شده
    const left = Math.min(screenshotStart.x, screenshotEnd.x);
    const top = Math.min(screenshotStart.y, screenshotEnd.y);
    const width = Math.abs(screenshotEnd.x - screenshotStart.x);
    const height = Math.abs(screenshotEnd.y - screenshotStart.y);

    // استفاده از چهار مستطیل برای ایجاد یک حفره در وسط
    return (
      <>
        {/* مستطیل بالا */}
        <div
          className="screenshot-background"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: `${top}px`,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            pointerEvents: 'none',
            zIndex: 40,
          }}
        />
        {/* مستطیل پایین */}
        <div
          className="screenshot-background"
          style={{
            position: 'absolute',
            left: 0,
            top: `${top + height}px`,
            width: '100%',
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            pointerEvents: 'none',
            zIndex: 40,
          }}
        />
        {/* مستطیل چپ */}
        <div
          className="screenshot-background"
          style={{
            position: 'absolute',
            left: 0,
            top: `${top}px`,
            width: `${left}px`,
            height: `${height}px`,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            pointerEvents: 'none',
            zIndex: 40,
          }}
        />
        {/* مستطیل راست */}
        <div
          className="screenshot-background"
          style={{
            position: 'absolute',
            left: `${left + width}px`,
            top: `${top}px`,
            right: 0,
            height: `${height}px`,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            pointerEvents: 'none',
            zIndex: 40,
          }}
        />
      </>
    );
  };

  // تابع برای گرفتن اسکرین‌شات کامل صفحه جاری
  const handleScreenshot = () => {
    if (!screenshotMode) {
      // اگر حالت اسکرین شات فعال نیست، آن را فعال کنید
      toggleScreenshotMode();
    } else {
      // اگر حالت اسکرین شات فعال است و کاربر فقط می‌خواهد از آن خارج شود (بدون انتخاب ناحیه)
      if (!screenshotStart || !screenshotEnd) {
        // فقط از حالت اسکرین‌شات خارج شو
        toggleScreenshotMode();
        return;
      }
      
      // اگر حالت اسکرین شات فعال است و ناحیه انتخاب شده، یک اسکرین شات از ناحیه انتخاب شده بگیرید
      if (currentPage < 1 || currentPage > numPages) return;

      const index = currentPage - 1;
      const pageContainer = document.querySelector(`.pdf-page-container:nth-child(${index + 1})`) as HTMLElement;
      if (!pageContainer) {
        console.error('Page container not found, trying alternative selector');
        // تلاش برای پیدا کردن با سلکتور دیگر
        const containers = document.querySelectorAll('.pdf-page-container');
        if (!containers || containers.length === 0 || !containers[index]) {
          console.error('All alternatives failed. PDF container not found');
          return;
        }
        console.log('Found container with alternative selector');
      }

      const targetContainer = pageContainer || (document.querySelectorAll('.pdf-page-container')[index] as HTMLElement);
      console.log('Taking screenshot of container:', targetContainer);

      import('html2canvas').then(({ default: html2canvas }) => {
        // به جای استفاده مستقیم از pdfPage، کل کانتینر صفحه را که شامل هایلایت‌ها هم هست انتخاب می‌کنیم
        const pageWithHighlights = targetContainer;
        
        // قبل از اسکرین‌شات، لایه خاکستری را موقتاً پنهان می‌کنیم
        const screenshotOverlay = document.querySelector('.screenshot-overlay');
        const screenshotBackground = document.querySelector('.screenshot-background');
        if (screenshotOverlay) {
          (screenshotOverlay as HTMLElement).style.display = 'none';
        }
        if (screenshotBackground) {
          (screenshotBackground as HTMLElement).style.display = 'none';
        }
        
        html2canvas(pageWithHighlights, {
          scale: 4, // افزایش مقیاس برای کیفیت بهتر
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          ignoreElements: (element) => {
            // حذف المان‌های اضافی مثل ابزار رسم و غیره که باید در اسکرین‌شات نباشند
            return element.classList.contains('drawing-tools') || 
                   element.classList.contains('screenshot-overlay') ||
                   element.classList.contains('screenshot-background');
          },
          onclone: (documentClone, element) => {
            // اطمینان از نمایش هایلایت‌ها در نسخه کلون شده
            const highlights = documentClone.querySelectorAll('.pdf-highlight');
            highlights.forEach(highlight => {
              // اطمینان از اینکه هایلایت‌ها قابل رؤیت هستند
              (highlight as HTMLElement).style.opacity = '1';
              (highlight as HTMLElement).style.visibility = 'visible';
              (highlight as HTMLElement).style.display = 'block';
            });
            return documentClone;
          }
        }).then((canvas) => {
          // برگرداندن لایه‌ها به حالت قبلی
          if (screenshotOverlay) {
            (screenshotOverlay as HTMLElement).style.display = 'block';
          }
          if (screenshotBackground) {
            (screenshotBackground as HTMLElement).style.display = 'block';
          }
          // تبدیل به تصویر و ارسال به چت
          const imageData = canvas.toDataURL('image/png');

          if (onScreenshot) {
            onScreenshot(imageData);
          } else if (onDrawingComplete) {
            console.log('Using onDrawingComplete callback...');
            // اگر onScreenshot تعریف نشده باشد، از onDrawingComplete استفاده کن
            onDrawingComplete(imageData);
          }

          // غیرفعال کردن حالت اسکرین‌شات
          setScreenshotMode(false);
        }).catch((err) => {
          console.error('Error capturing screenshot:', err);
        });
      }).catch((err) => {
        console.error('Error loading html2canvas:', err);
      });
    }
  };

  // اضافه کردن useEffect برای Intersection Observer
  useEffect(() => {
    if (!numPages || !pdfUrl) return;

    // تنظیمات observer
    const observerOptions = {
      root: containerRef.current,
      rootMargin: '0px',
      threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
    };

    // ایجاد observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const pageNumber = parseInt(entry.target.getAttribute('data-page-number') || '0', 10);
        if (entry.isIntersecting) {
          pageVisibilityRatio.set(pageNumber, entry.intersectionRatio);
        } else {
          pageVisibilityRatio.set(pageNumber, 0);
        }
      });

      // اگر اسکرول در بالای صفحه است (نزدیک به صفحه اول)
      if (containerRef.current) {
        const scrollTop = containerRef.current.scrollTop;
        const firstPageVisible = pageVisibilityRatio.get(1) || 0;
        
        // اگر در بالای صفحه هستیم (100 پیکسل اول) و کمی از صفحه 1 نمایان است
        if (scrollTop < 100 && firstPageVisible > 0) {
          console.log("Top scroll detected, forcing page 1");
          setCurrentPage(1);
          setInputPage("1");
          return;
        }
      }

      // بررسی کدام صفحه بیشترین نسبت نمایش را دارد
      let maxRatio = 0;
      let mostVisiblePage = currentPage; // شروع با صفحه فعلی برای پایداری بیشتر

      // اولویت ویژه به صفحه اول (بیش از دو برابر وزن)
      const firstPageRatio = pageVisibilityRatio.get(1) || 0;
      if (firstPageRatio > 0) {
        // برای صفحه اول آستانه پایین‌تری قرار می‌دهیم
        if (firstPageRatio > 0.05) {
          // با وزن بیشتر برای صفحه اول
          maxRatio = firstPageRatio * 2.5;
          mostVisiblePage = 1;
        }
      }
      
      // بررسی سایر صفحات
      for (const [pageNumber, ratio] of pageVisibilityRatio.entries()) {
        if (pageNumber !== 1) { // صفحات غیر از صفحه اول را با وزن عادی بررسی می‌کنیم
          if (ratio > maxRatio) {
            maxRatio = ratio;
            mostVisiblePage = pageNumber;
          }
        }
      }

      // به‌روزرسانی شماره صفحه فعلی
      if (mostVisiblePage !== currentPage && maxRatio > 0) {
        setCurrentPage(mostVisiblePage);
        setInputPage(mostVisiblePage.toString());
        console.log(`Auto-updating current page to ${mostVisiblePage} (visibility ratio: ${maxRatio.toFixed(2)})`);
      }
    }, observerOptions);

    // اضافه کردن observer به تمام صفحات PDF
    const pdfPages = document.querySelectorAll('.pdf-page-container');
    pdfPages.forEach(page => {
      observer.observe(page);
    });

    // پاکسازی
    return () => {
      observer.disconnect();
    };
  }, [numPages, pdfUrl, containerRef]);

  // اضافه کردن یک رویداد اسکرول به container برای تشخیص بهتر صفحه اول
  useEffect(() => {
    const containerElement = containerRef.current;
    if (!containerElement) return;

    // تابع تشخیص اسکرول به بالا
    const handleScroll = () => {
      if (!containerElement) return;
      
      // اگر به اندازه کافی نزدیک به بالای صفحه هستیم (250 پیکسل اول)
      if (containerElement.scrollTop < 250) {
        // فقط اگر صفحه فعلی 1 نیست، آن را به 1 تغییر دهید
        if (currentPage !== 1) {
          console.log("Top of document detected, setting page to 1");
          setCurrentPage(1);
          setInputPage("1");
        }
      } else if (containerElement.scrollTop < 800 && currentPage > 2) {
        // اگر در ناحیه صفحه 2 هستیم اما شماره صفحه بزرگتر از 2 است
        setCurrentPage(2);
        setInputPage("2");
      }
    };

    // اضافه کردن event listener
    containerElement.addEventListener('scroll', handleScroll);
    
    // پاکسازی
    return () => {
      containerElement.removeEventListener('scroll', handleScroll);
    };
  }, [containerRef, currentPage]);

  // اثر جانبی برای فعال/غیرفعال کردن انتخاب متن
  useEffect(() => {
    console.log(`Highlight mode is now: ${highlightMode ? 'ON' : 'OFF'}`);

    if (!highlightMode) return;

    // برای مدیریت هایلایت کردن متن
    const handleDocumentMouseUp = (e: MouseEvent) => {
      // کمی تاخیر برای اطمینان از کامل شدن انتخاب
      setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;

        const selectedText = selection.toString().trim();
        if (!selectedText) return;

        console.log(`Text selected: "${selectedText}"`);

        try {
          // روش جدید برای پیدا کردن صفحه با استفاده از DOM مستقیم
          // به جای استفاده از pageRefs که به نظر می‌رسد مشکل دارد

          // پیدا کردن موقعیت ماوس
          const mouseX = e.clientX;
          const mouseY = e.clientY;

          // پیدا کردن تمام صفحات PDF
          const pdfPages = document.querySelectorAll('.pdf-page-container');
          let targetPage: Element | null = null;
          let pageIndex = -1;

          console.log(`Found ${pdfPages.length} PDF pages in DOM`);

          // بررسی همه صفحات برای پیدا کردن صفحه‌ای که ماوس روی آن است
          for (let i = 0; i < pdfPages.length; i++) {
            const page = pdfPages[i];
            const rect = page.getBoundingClientRect();

            if (mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom) {
              targetPage = page;
              pageIndex = i;
              console.log(`Found page ${i + 1} for highlight at mouse position using DOM`);
              break;
            }
          }

          // اگر با موقعیت ماوس پیدا نشد، از موقعیت محدوده انتخاب استفاده کن
          if (!targetPage) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            for (let i = 0; i < pdfPages.length; i++) {
              const page = pdfPages[i];
              const pageRect = page.getBoundingClientRect();

              if (centerX >= pageRect.left && centerX <= pageRect.right && centerY >= pageRect.top && centerY <= pageRect.bottom) {
                targetPage = page;
                pageIndex = i;
                console.log(`Found page ${i + 1} for highlight at selection center using DOM`);
                break;
              }
            }
          }

          // اگر هنوز صفحه پیدا نشده، از صفحه فعلی استفاده کن
          if (!targetPage && pdfPages.length > 0) {
            // استفاده از صفحه فعلی (با کسر 1 چون شاخص‌ها از 0 شروع می‌شوند)
            const currentPageIndex = Math.min(currentPage - 1, pdfPages.length - 1);
            targetPage = pdfPages[currentPageIndex];
            pageIndex = currentPageIndex;
            console.log(`Using current page ${pageIndex + 1} as fallback for highlight`);
          }

          if (!targetPage) {
            console.error("Cannot find any PDF page for highlight");
            return;
          }

          console.log(`Using page ${pageIndex + 1} for highlight (DOM method)`);

          // محاسبه مستطیل‌های هایلایت
          const range = selection.getRangeAt(0);
          const rects = range.getClientRects();
          const pageBounds = targetPage.getBoundingClientRect();
          const highlightRects: HighlightRect[] = [];

          for (let i = 0; i < rects.length; i++) {
            const rect = rects[i];

            // تبدیل به مختصات نسبی
            const relativeX = (rect.left - pageBounds.left) / scale;
            const relativeY = (rect.top - pageBounds.top) / scale;
            const width = rect.width / scale;
            const height = rect.height / scale;

            // مطمئن شو که مختصات وارد صفحه هستند
            if (relativeX >= 0 && relativeY >= 0) {
              highlightRects.push({
                x: relativeX,
                y: relativeY,
                width,
                height,
              });

              console.log(`Created highlight rect ${i}: x=${relativeX.toFixed(2)}, y=${relativeY.toFixed(2)}, w=${width.toFixed(2)}, h=${height.toFixed(2)}`);
            }
          }

          // ایجاد هایلایت جدید
          if (highlightRects.length > 0) {
            const newHighlight: Highlight = {
              id: uuidv4(),
              pageIndex,
              rects: highlightRects,
              text: selectedText,
              color: 'rgba(255, 255, 0, 0.3)',
            };

            console.log('Adding new highlight:', newHighlight);
            setHighlights((prev) => [...prev, newHighlight]);

            // پاک کردن انتخاب
            selection.removeAllRanges();
          } else {
            console.warn('No valid highlight rectangles created');
          }
        } catch (error) {
          console.error('Error creating highlight:', error);
        }
      }, 100);
    };

    // چک کردن و فعال کردن لایه‌های متنی هر 500ms تا زمانی که همه آنها پیدا شوند
    const checkInterval = setInterval(enableTextSelection, 500);

    // اضافه کردن event listeners
    document.addEventListener('mouseup', handleDocumentMouseUp);

    return () => {
      clearInterval(checkInterval);
      document.removeEventListener('mouseup', handleDocumentMouseUp);

      // غیرفعال کردن انتخاب متن
      const textLayers = document.querySelectorAll('.react-pdf__Page__textContent');
      textLayers.forEach((textLayer) => {
        if (textLayer) {
          (textLayer as HTMLElement).style.userSelect = 'none';
          (textLayer as HTMLElement).style.pointerEvents = 'none';
        }
      });
    };
  }, [highlightMode, scale, currentPage]);

  // مدیریت بارگذاری فایل PDF
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log(`Selected file: ${file.name}`);
    const fileReader = new FileReader();
    
    fileReader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // ذخیره PDF در localStorage برای استفاده‌های بعدی
      try {
        await storePdf(resourceId, arrayBuffer);
        console.log('PDF stored successfully');
      } catch (error) {
        console.error('Failed to store PDF:', error);
      }
      
      setPdfUrl(url);
      setIsLoading(false);
    };
    
    fileReader.readAsArrayBuffer(file);
  };

  return (
    <div className="flex flex-col h-full" ref={outerContainerRef}>
      <div className="relative flex-1 overflow-auto bg-[#0F0F0F] rounded-xl p-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : !pdfUrl ? (
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
            <Upload className="h-12 w-12 text-gray-400 mb-2" />
            <h3 className="text-lg font-medium mb-1">{fileName || 'بارگذاری PDF'}</h3>
            <p className="text-sm text-gray-500 mb-4">PDF را بکشید و رها کنید یا برای انتخاب کلیک کنید</p>
            <Label
              htmlFor="pdf-upload"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md cursor-pointer"
            >
              انتخاب فایل
            </Label>
            <input
              id="pdf-upload"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div
            className="relative h-full flex flex-col items-center bg-background/95 backdrop-blur-sm"
            style={{ direction: 'ltr' }}
          >
            <div className="w-full bg-background/95 backdrop-blur-sm border-b border-[#333] mb-2">
              <PDFZoomControls
                zoom={100}
                currentPage={currentPage}
                totalPages={numPages}
                inputPage={inputPage}
                onZoomIn={() => setScale((prevScale) => {
                  const newScale = prevScale + 0.1;
                  return newScale;
                })}
                onZoomOut={() => setScale((prevScale) => {
                  const newScale = Math.max(0.5, prevScale - 0.1);
                  return newScale;
                })}
                onResetZoom={() => {
                  setScale(1.0);
                }}
                onPageInputChange={(e) => {
                  setInputPage(e.target.value);
                  const pageNumber = parseInt(e.target.value);
                  if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= numPages) {
                    setCurrentPage(pageNumber);
                  }
                }}
                onPageChange={(newPage) => {
                  if (newPage >= 1 && newPage <= numPages) {
                    setCurrentPage(newPage);
                    setInputPage(newPage.toString());

                    // اسکرول به صفحه انتخاب شده
                    const pageContainer = document.getElementById(`page_wrapper_${newPage}`);
                    if (pageContainer) {
                      pageContainer.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                        inline: 'nearest',
                      });
                    }
                  }
                }}
                drawingMode={drawingMode}
                onToggleDrawing={toggleDrawingMode}
                screenshotMode={screenshotMode}
                onToggleScreenshot={() => {
                  const newMode = !screenshotMode;
                  console.log('Screenshot mode toggled:', newMode);
                  setScreenshotMode(newMode);
                  if (newMode) {
                    setDrawingMode(false);
                    setHighlightMode(false);
                  }
                }}
                onScreenshot={handleScreenshot}
                highlightMode={highlightMode}
                onToggleHighlight={toggleHighlightMode}
                debugMode={true} // فعال کردن حالت debug برای مشاهده جزئیات بیشتر
              />
            </div>

            <div
              className="relative flex-1 w-full overflow-auto max-h-full bg-background/95 backdrop-blur-sm"
              ref={containerRef}
              style={{ maxHeight: 'calc(100vh - 200px)' }}
            >
              <Document
                file={pdfUrl}
                onLoadSuccess={({ numPages }) => {
                  setNumPages(numPages);
                  setLoadError(null);
                }}
                onLoadError={(error) => {
                  console.error('Error loading PDF document:', error);
                  setLoadError(error);
                  toast({
                    title: 'خطا در بارگذاری PDF',
                    description: 'فایل PDF قابل بارگذاری نیست. لطفا دوباره تلاش کنید یا فایل دیگری انتخاب کنید.',
                    variant: 'destructive',
                  });
                }}
                options={setPdfOptions}
                className="flex flex-col items-center bg-background/95 backdrop-blur-sm"
              >
                {Array.from(new Array(numPages), (el, index) => (
                  <div
                    key={`page_wrapper_${index + 1}`}
                    id={`page_wrapper_${index + 1}`}
                    className="w-full flex justify-center mb-4 pdf-page-container relative"
                    data-page-number={index + 1}
                  >
                    <div className="relative w-full">
                      <Page
                        key={`page_${index + 1}`}
                        pageNumber={index + 1}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                        scale={scale}
                        className={`shadow-xl rounded-lg overflow-hidden w-full ${highlightMode ? 'text-select-enabled' : ''}`}
                        width={containerSize.width > 0 ? Math.max(containerSize.width * 0.95, 100) : undefined}
                        canvasBackground="white"
                        inputRef={(ref: any) => {
                          if (ref?.containerNode) {
                            // pageRefs.current[index] = ref.containerNode;
                          }
                        }}
                        onLoadSuccess={(page) => {
                          console.log(`Page ${page.pageNumber} loaded.`);
                        }}
                      />
                      <canvas
                        ref={(el) => (canvasRefs.current[index] = el)}
                        className="canvas-layer drawing-canvas"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          pointerEvents: drawingMode || screenshotMode ? 'auto' : 'none',
                          cursor: drawingMode 
                            ? 'crosshair' 
                            : screenshotMode 
                              ? 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'><path d=\'M11 2h2v20h-2V2z\' fill=\'white\'/><path d=\'M2 11h20v2H2v-2z\' fill=\'white\'/></svg>") 12 12, auto'
                              : 'default',
                          zIndex: 20,
                        }}
                        onMouseDown={(e) => {
                          console.log('Canvas mousedown event:', { drawingMode, screenshotMode, highlightMode });
                          if (drawingMode) {
                            handleDrawingStart(e, index);
                            e.stopPropagation(); // جلوگیری از انتشار رویداد به عناصر زیرین
                          } else if (screenshotMode) {
                            startScreenshot(e);
                            e.stopPropagation(); // جلوگیری از انتشار رویداد به عناصر زیرین
                          } else if (highlightMode) {
                            // TODO: Add highlight functionality
                          }
                        }}
                        onMouseMove={(e) => {
                          if (screenshotMode && screenshotStart) {
                            updateScreenshot(e);
                            e.stopPropagation();
                          }
                        }}
                        onMouseUp={(e) => {
                          if (screenshotMode && screenshotStart) {
                            finishScreenshot(e);
                            e.stopPropagation();
                          }
                        }}
                      />

                      {/* لایه هایلایت‌ها */}
                      <div
                        className="highlight-layer"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          pointerEvents: 'none',
                          zIndex: 30,
                        }}
                      >
                        {highlights
                          .filter((h) => h.pageIndex === index)
                          .map((highlight) =>
                            highlight.rects.map((rect, rectIndex) => (
                              <div
                                key={`${highlight.id}-${rectIndex}`}
                                style={{
                                  position: 'absolute',
                                  left: `${rect.x * scale}px`,
                                  top: `${rect.y * scale}px`,
                                  width: `${rect.width * scale}px`,
                                  height: `${rect.height * scale}px`,
                                  backgroundColor: highlight.color || 'rgba(255, 255, 0, 0.3)',
                                  pointerEvents: 'none',
                                  mixBlendMode: 'multiply',
                                  borderRadius: '2px',
                                }}
                              />
                            ))
                          )}
                      </div>

                      {/* لایه اسکرین‌شات - نمایش مستطیل انتخاب شده */}
                      {screenshotMode && (
                        <>
                          <ScreenshotBackground />
                          <ScreenshotOverlay />
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </Document>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};