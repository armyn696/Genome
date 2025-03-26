import React, { useState, useEffect, useRef } from 'react';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { retrievePdf, storePdf } from '@/utils/pdfStorage';
import { useToast } from '@/components/ui/use-toast';
import { PDFZoomControls } from './PDFZoomControls';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { configurePdfJs, setPdfOptions } from '@/utils/pdfConfig';

// تنظیم کانفیگ pdfjs
configurePdfJs();

interface PDFViewerProps {
  resourceId: string;
  displayName: string;
  fileName?: string;
  onDrawingComplete?: (imageData: string) => void;
  onScreenshot?: (screenshotData: string, fileName: string) => void;
}

interface Line {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  resourceId,
  displayName,
  fileName,
  onDrawingComplete,
  onScreenshot,
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSelectable, setIsSelectable] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [inputPage, setInputPage] = useState<string>('1');
  const containerRef = useRef<HTMLDivElement>(null);
  const outerContainerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // state برای نقاشی
  const [drawingMode, setDrawingMode] = useState<boolean>(false);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const linesRef = useRef<Line[][]>([]); // آرایه‌ای برای ذخیره خطوط هر صفحه

  // state برای اسکرین‌شات
  const [screenshotMode, setScreenshotMode] = useState<boolean>(false);
  const [screenshotStart, setScreenshotStart] = useState<{ x: number; y: number } | null>(null);
  const [screenshotEnd, setScreenshotEnd] = useState<{ x: number; y: number } | null>(null);

  // تنظیم ابعاد کنواس‌ها و رندر خطوط
  const setupCanvases = () => {
    canvasRefs.current.forEach((canvas, index) => {
      if (canvas) {
        const pdfPage = document.querySelector(`.pdf-page-container:nth-child(${index + 1}) .react-pdf__Page`);
        if (pdfPage) {
          const rect = pdfPage.getBoundingClientRect();
          canvas.width = rect.width;
          canvas.height = rect.height;

          // رندر مجدد خطوط ذخیره‌شده
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.strokeStyle = '#ff0000'; // رنگ قرمز
            ctx.lineWidth = 1; // خط نازک 1 پیکسل
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            const lines = linesRef.current[index] || [];
            lines.forEach((line) => {
              ctx.beginPath();
              ctx.moveTo(line.startX, line.startY);
              ctx.lineTo(line.endX, line.endY);
              ctx.stroke();
            });
          }
        }
      }
    });
  };

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
          setupCanvases(); // تنظیم مجدد ابعاد کنواس‌ها و رندر خطوط
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
      setupCanvases();
    }
  }, [numPages]);

  // مدیریت رویدادهای نقاشی
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>, index: number) => {
    if (!drawingMode) return;

    const canvas = canvasRefs.current[index];
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let lastX = (e.clientX - rect.left) * (canvas.width / rect.width);
    let lastY = (e.clientY - rect.top) * (canvas.height / rect.height);

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.strokeStyle = '#ff0000'; // رنگ قرمز
    ctx.lineWidth = 1; // خط نازک 1 پیکسل
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const draw = (e: MouseEvent) => {
      const currentX = (e.clientX - rect.left) * (canvas.width / rect.width);
      const currentY = (e.clientY - rect.top) * (canvas.height / rect.height);

      // اضافه کردن خط به آرایه
      const newLine: Line = {
        startX: lastX,
        startY: lastY,
        endX: currentX,
        endY: currentY,
      };
      linesRef.current[index].push(newLine);

      // رندر خط جدید
      ctx.lineTo(currentX, currentY);
      ctx.stroke();

      lastX = currentX;
      lastY = currentY;
    };

    const stopDrawing = () => {
      document.removeEventListener('mousemove', draw);
      document.removeEventListener('mouseup', stopDrawing);

      console.log('Drawing completed, sending to chat...');
      
      // صبر برای تکمیل رندر
      setTimeout(() => {
        // گرفتن تصویر از صفحه PDF و نقاشی‌ها
        const pageContainer = document.querySelector(`.pdf-page-container:nth-child(${index + 1})`) as HTMLElement;
        if (!pageContainer) {
          console.error('Page container not found');
          return;
        }

        // ایجاد کنواس موقت برای ترکیب PDF و نقاشی
        const tempCanvas = document.createElement('canvas');
        const pageRect = pageContainer.getBoundingClientRect();
        tempCanvas.width = pageRect.width;
        tempCanvas.height = pageRect.height;

        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) {
          console.error('Failed to get canvas context');
          return;
        }

        // گرفتن عکس از کل صفحه با html2canvas
        import('html2canvas').then((html2canvas) => {
          html2canvas.default(pageContainer, {
            scale: 4, // افزایش مقیاس برای کیفیت بهتر
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
            logging: true,
            imageTimeout: 0, // افزایش تایم‌اوت برای تصاویر بزرگتر
            onclone: (document) => {
              // این تابع قبل از استخراج تصویر فراخوانی می‌شود
              console.log('Preparing document for screenshot...');
              // می‌توانیم استایل‌های اضافی برای بهبود کیفیت اعمال کنیم
              const targetElement = document.querySelector(`.pdf-page-container:nth-child(${index + 1})`) as HTMLElement;
              if (targetElement) {
                targetElement.style.transform = 'none'; // حذف هرگونه transform که ممکن است کیفیت را کاهش دهد
              }
              return document;
            }
          }).then((canvas) => {
            // تبدیل به تصویر و ارسال به چت
            const imageData = canvas.toDataURL('image/png');
            console.log('Image captured, sending to chat...');
            if (onDrawingComplete) {
              onDrawingComplete(imageData);
              
              // پاک کردن نقاشی بعد از ارسال به چت
              const canvasToClear = canvasRefs.current[index];
              if (canvasToClear) {
                const ctx = canvasToClear.getContext('2d');
                if (ctx) {
                  ctx.clearRect(0, 0, canvasToClear.width, canvasToClear.height);
                  // پاک کردن آرایه خطوط کشیده شده
                  linesRef.current[index] = [];
                }
              }
            }
          }).catch(err => {
            console.error('Error capturing screenshot:', err);
          });
        }).catch(err => {
          console.error('Error loading html2canvas:', err);
        });
      }, 500);
    };

    document.addEventListener('mousemove', draw);
    document.addEventListener('mouseup', stopDrawing);
  };

  const toggleScreenshotMode = () => {
    const newMode = !screenshotMode;
    console.log('Screenshot mode toggled:', newMode);
    setScreenshotMode(newMode);
    if (drawingMode) setDrawingMode(false);
  };

  const startScreenshot = (e: React.MouseEvent<HTMLCanvasElement>, index: number) => {
    if (!screenshotMode) return;
    console.log('Starting screenshot selection at index:', index);
    
    const canvas = canvasRefs.current[index];
    if (!canvas) {
      console.error('Canvas ref not found for index:', index);
      return;
    }
    
    const pos = getScreenshotMousePos(canvas, e);
    console.log('Screenshot start position:', pos);
    setScreenshotStart(pos);
    setScreenshotEnd(pos);
    
    // برای اطمینان از اینکه کاربر می‌تواند مشاهده کند که حالت اسکرین‌شات فعال است
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // پاک کردن canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setupCanvases(); // بازگرداندن خطوط
        
        // رسم نقطه شروع
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  };

  const updateScreenshot = (e: React.MouseEvent<HTMLCanvasElement>, index: number) => {
    if (!screenshotMode || !screenshotStart) return;
    
    const canvas = canvasRefs.current[index];
    if (!canvas) return;
    
    const pos = getScreenshotMousePos(canvas, e);
    setScreenshotEnd(pos);
    
    // کشیدن مستطیل انتخاب
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // پاک کردن canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setupCanvases(); // بازگرداندن خطوط قبلی
    
    // کشیدن مستطیل نیمه‌شفاف
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // کشیدن مستطیل انتخاب شده
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
    if (!screenshotMode || !screenshotStart) return;
    
    const canvas = canvasRefs.current[index];
    if (!canvas) return;
    
    // پایان دادن به اسکرین‌شات
    const pos = getScreenshotMousePos(canvas, e);
    const tempScreenshotEnd = pos;
    setScreenshotEnd(pos);
    
    // پاک کردن مستطیل انتخاب
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // پاک کردن مستطیل انتخاب
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setupCanvases(); // بازگرداندن خطوط
    
    // ذخیره مختصات قبل از ریست کردن حالت
    const tempScreenshotStart = { ...screenshotStart };
    
    // محاسبه مختصات و ابعاد ناحیه انتخاب شده
    const x = Math.min(tempScreenshotStart.x, tempScreenshotEnd.x);
    const y = Math.min(tempScreenshotStart.y, tempScreenshotEnd.y);
    const width = Math.abs(tempScreenshotEnd.x - tempScreenshotStart.x);
    const height = Math.abs(tempScreenshotEnd.y - tempScreenshotStart.y);
    
    console.log('Screenshot coordinates:', { x, y, width, height });
    
    // اگر سایز انتخاب خیلی کوچک باشد، احتمالاً کلیک تصادفی بوده
    if (width < 10 || height < 10) {
      setScreenshotMode(false);
      setScreenshotStart(null);
      setScreenshotEnd(null);
      return;
    }
    
    // ریست کردن حالت اسکرین‌شات
    setScreenshotMode(false);
    setScreenshotStart(null);
    setScreenshotEnd(null);
    
    // گرفتن تصویر از صفحه PDF فعلی با html2canvas
    const pageContainer = document.querySelector(`.pdf-page-container:nth-child(${index + 1})`) as HTMLElement;
    if (!pageContainer) {
      console.error('Page container not found, trying alternative selector');
      // تلاش برای پیدا کردن با سلکتور دیگر
      const alternativeContainer = document.querySelectorAll('.pdf-page-container')[index] as HTMLElement | undefined;
      if (!alternativeContainer) {
        console.error('All alternatives failed. PDF container not found');
        return;
      }
      console.log('Found container with alternative selector');
    }
    
    const targetContainer = pageContainer || (document.querySelectorAll('.pdf-page-container')[index] as HTMLElement);
    console.log('Using page container:', targetContainer);
    
    // محاسبه نسبت مقیاس بین canvas و المان واقعی PDF
    const pageRect = targetContainer.getBoundingClientRect();
    const scaleX = pageRect.width / canvas.width;
    const scaleY = pageRect.height / canvas.height;
    
    // محاسبه مختصات در فضای واقعی صفحه
    const realX = x * scaleX;
    const realY = y * scaleY;
    const realWidth = width * scaleX;
    const realHeight = height * scaleY;
    
    console.log('Real coordinates:', { realX, realY, realWidth, realHeight });
    console.log('Page rectangle:', { 
      left: pageRect.left, 
      top: pageRect.top, 
      width: pageRect.width, 
      height: pageRect.height 
    });
    
    import('html2canvas').then((html2canvas) => {
      html2canvas.default(targetContainer, {
        scale: 4, // افزایش مقیاس برای کیفیت بهتر
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: true,
        imageTimeout: 0, // افزایش تایم‌اوت برای تصاویر بزرگتر
        onclone: (document) => {
          // این تابع قبل از استخراج تصویر فراخوانی می‌شود
          console.log('Preparing document for screenshot...');
          // می‌توانیم استایل‌های اضافی برای بهبود کیفیت اعمال کنیم
          const targetElement = document.querySelector(`.pdf-page-container:nth-child(${index + 1})`) as HTMLElement;
          if (targetElement) {
            targetElement.style.transform = 'none'; // حذف هرگونه transform که ممکن است کیفیت را کاهش دهد
          }
          return document;
        }
      }).then((capturedCanvas) => {
        // ایجاد کنواس موقت برای برش ناحیه انتخاب شده
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = realWidth;
        tempCanvas.height = realHeight;
        
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;
        
        console.log('Drawing cropped image from:', { 
          sourceX: realX, 
          sourceY: realY, 
          width: realWidth, 
          height: realHeight,
          canvasWidth: capturedCanvas.width,
          canvasHeight: capturedCanvas.height
        });
        
        // کپی ناحیه انتخاب شده به کنواس موقت با مقیاس صحیح
        const canvasScaleX = capturedCanvas.width / pageRect.width;
        const canvasScaleY = capturedCanvas.height / pageRect.height;
        
        tempCtx.drawImage(
          capturedCanvas,
          realX * canvasScaleX, realY * canvasScaleY, 
          realWidth * canvasScaleX, realHeight * canvasScaleY,
          0, 0, realWidth, realHeight
        );
        
        // تبدیل به تصویر و ارسال به چت
        const imageData = tempCanvas.toDataURL('image/png');
        console.log('Screenshot captured, sending to chat...', imageData.substring(0, 100) + '...');
        
        if (onScreenshot) {
          console.log('Using onScreenshot callback...');
          const screenshotFileName = `screenshot-${index + 1}-${Date.now()}.png`;
          onScreenshot(imageData, screenshotFileName);
        } else if (onDrawingComplete) {
          console.log('Using onDrawingComplete callback...');
          // اگر onScreenshot تعریف نشده باشد، از onDrawingComplete استفاده کن
          onDrawingComplete(imageData);
        } else {
          console.error('No callback available to send screenshot to chat!');
        }
      }).catch(err => {
        console.error('Error capturing screenshot:', err);
      });
    }).catch(err => {
      console.error('Error loading html2canvas:', err);
    });
  };

  // تابع برای گرفتن اسکرین‌شات کامل صفحه جاری
  const handleScreenshot = () => {
    if (!screenshotMode) {
      // اگر حالت اسکرین شات فعال نیست، آن را فعال کنید
      toggleScreenshotMode();
    } else {
      // اگر حالت اسکرین شات فعال است، یک اسکرین شات کامل از صفحه جاری بگیرید
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
      
      import('html2canvas').then((html2canvas) => {
        html2canvas.default(targetContainer, {
          scale: 4, // افزایش مقیاس برای کیفیت بهتر
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          logging: true,
          imageTimeout: 0, // افزایش تایم‌اوت برای تصاویر بزرگتر
          onclone: (document) => {
            // این تابع قبل از استخراج تصویر فراخوانی می‌شود
            console.log('Preparing document for screenshot...');
            // می‌توانیم استایل‌های اضافی برای بهبود کیفیت اعمال کنیم
            const targetElement = document.querySelector(`.pdf-page-container:nth-child(${index + 1})`) as HTMLElement;
            if (targetElement) {
              targetElement.style.transform = 'none'; // حذف هرگونه transform که ممکن است کیفیت را کاهش دهد
            }
            return document;
          }
        }).then((canvas) => {
          // تبدیل به تصویر و ارسال به چت
          const imageData = canvas.toDataURL('image/png');
          console.log('Full page screenshot captured, sending to chat...');
          
          if (onScreenshot) {
            const screenshotFileName = `screenshot-page-${currentPage}-${Date.now()}.png`;
            onScreenshot(imageData, screenshotFileName);
          } else if (onDrawingComplete) {
            // اگر onScreenshot تعریف نشده باشد، از onDrawingComplete استفاده کن
            onDrawingComplete(imageData);
          }
          
          // غیرفعال کردن حالت اسکرین‌شات
          setScreenshotMode(false);
        }).catch(err => {
          console.error('Error capturing screenshot:', err);
        });
      }).catch(err => {
        console.error('Error loading html2canvas:', err);
      });
    }
  };

  // محاسبه موقعیت موس برای اسکرین‌شات
  const getScreenshotMousePos = (canvas: HTMLCanvasElement, evt: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvas.getBoundingClientRect();
    
    // محاسبه مقیاس واقعی
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // محاسبه موقعیت موس
    const x = (evt.clientX - rect.left) * scaleX;
    const y = (evt.clientY - rect.top) * scaleY;
    
    return { x, y };
  };

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoadError(null);
  };

  const handleDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF document:', error);
    setLoadError(error);
    toast({
      title: 'خطا در بارگذاری PDF',
      description: 'فایل PDF قابل بارگذاری نیست. لطفا دوباره تلاش کنید یا فایل دیگری انتخاب کنید.',
      variant: 'destructive',
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= numPages) {
      setCurrentPage(newPage);
      setInputPage(newPage.toString());
    }
  };

  const handleZoomIn = () => {
    setScale((prevScale) => {
      const newScale = prevScale + 0.1;
      setZoom(Math.round(newScale * 100));
      return newScale;
    });
  };

  const handleZoomOut = () => {
    setScale((prevScale) => {
      const newScale = Math.max(0.5, prevScale - 0.1);
      setZoom(Math.round(newScale * 100));
      return newScale;
    });
  };

  const handleResetZoom = () => {
    setScale(1.0);
    setZoom(100);
  };

  const toggleDrawing = () => {
    setDrawingMode((prev) => !prev);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: 'خطا در بارگذاری فایل',
        description: 'لطفاً یک فایل PDF انتخاب کنید.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { id, url, displayName: newDisplayName } = await storePdf(file);
      setPdfUrl(url);
      toast({
        title: 'بارگذاری موفقیت‌آمیز',
        description: `فایل "${newDisplayName}" با موفقیت بارگذاری شد.`,
      });
      setCurrentPage(1);
      setInputPage('1');
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast({
        title: 'خطا در بارگذاری',
        description: 'مشکلی در بارگذاری فایل رخ داد. لطفاً دوباره تلاش کنید.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderPdfUploader = () => (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/30">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="p-4 bg-primary/10 rounded-full">
          <Upload className="h-12 w-12 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-xl">فایل PDF خود را بارگذاری کنید</h3>
          <p className="text-muted-foreground">برای شروع، یک فایل PDF را از سیستم خود انتخاب کنید</p>
        </div>
        <div className="w-full max-w-sm">
          <Label htmlFor="pdf-upload" className="sr-only">بارگذاری فایل PDF</Label>
          <input
            id="pdf-upload"
            type="file"
            accept="application/pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="default"
            className="w-full"
            onClick={() => document.getElementById('pdf-upload')?.click()}
          >
            انتخاب فایل PDF
          </Button>
        </div>
      </div>
    </div>
  );

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(e.target.value);
    const pageNumber = parseInt(e.target.value);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= numPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="flex flex-col h-full" ref={outerContainerRef}>
      <div className="relative flex-1 overflow-auto bg-[#0F0F0F] rounded-xl p-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : !pdfUrl ? (
          renderPdfUploader()
        ) : (
          <div
            className="relative h-full flex flex-col items-center bg-background/95 backdrop-blur-sm"
            style={{ direction: 'ltr' }}
          >
            <div className="w-full bg-background/95 backdrop-blur-sm border-b border-[#333] mb-2">
              <PDFZoomControls
                zoom={zoom}
                currentPage={currentPage}
                totalPages={numPages}
                inputPage={inputPage}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onResetZoom={handleResetZoom}
                onPageInputChange={handlePageInputChange}
                onPageChange={handlePageChange}
                drawingMode={drawingMode}
                onToggleDrawing={toggleDrawing}
                screenshotMode={screenshotMode}
                onToggleScreenshot={toggleScreenshotMode}
                onScreenshot={handleScreenshot}
              />
            </div>

            <div
              className="relative flex-1 w-full overflow-auto max-h-full bg-background/95 backdrop-blur-sm"
              ref={containerRef}
              style={{ maxHeight: 'calc(100vh - 200px)' }}
            >
              <Document
                file={pdfUrl}
                onLoadSuccess={handleDocumentLoadSuccess}
                onLoadError={handleDocumentLoadError}
                options={setPdfOptions}
                className="flex flex-col items-center bg-background/95 backdrop-blur-sm"
              >
                {Array.from(new Array(numPages), (el, index) => (
                  <div
                    key={`page_wrapper_${index + 1}`}
                    className="w-full flex justify-center mb-4 pdf-page-container relative"
                  >
                    <div className="relative w-full">
                      <Page
                        key={`page_${index + 1}`}
                        pageNumber={index + 1}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                        scale={scale}
                        className="shadow-xl rounded-lg overflow-hidden w-full"
                        width={containerSize.width > 0 ? Math.max(containerSize.width * 0.95, 100) : undefined}
                        canvasBackground="white"
                      />
                      <canvas
                        ref={(el) => (canvasRefs.current[index] = el)}
                        className="canvas-layer"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          pointerEvents: drawingMode || screenshotMode ? 'auto' : 'none',
                          cursor: drawingMode ? 'crosshair' : screenshotMode ? 'crosshair' : 'default',
                          zIndex: 50, // افزایش z-index برای اطمینان از قرارگیری بالاتر از PDF
                        }}
                        onMouseDown={(e) => {
                          console.log('Canvas mousedown event:', { drawingMode, screenshotMode });
                          if (drawingMode) {
                            startDrawing(e, index);
                          } else if (screenshotMode) {
                            startScreenshot(e, index);
                            e.stopPropagation(); // جلوگیری از انتشار رویداد به عناصر زیرین
                          }
                        }}
                        onMouseMove={(e) => {
                          if (screenshotMode && screenshotStart) {
                            updateScreenshot(e, index);
                            e.stopPropagation();
                          }
                        }}
                        onMouseUp={(e) => {
                          if (screenshotMode && screenshotStart) {
                            finishScreenshot(e, index);
                            e.stopPropagation();
                          }
                        }}
                      />
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