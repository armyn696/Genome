import React, { useState, useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import { User, Bot, Camera } from 'lucide-react';
import { createPortal } from 'react-dom';
import ActionCard from '@/components/ui/ActionCard';

// مودال برای نمایش تصویر در اندازه بزرگ
export const ImageModal: React.FC<{ isOpen: boolean; onClose: () => void; imageSrc: string }> = ({ 
  isOpen, 
  onClose, 
  imageSrc 
}) => {
  const [screenshotMode, setScreenshotMode] = useState(false);
  const [screenshotStart, setScreenshotStart] = useState<{ x: number; y: number } | null>(null);
  const [screenshotEnd, setScreenshotEnd] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!isOpen) {
      // ریست کردن حالت اسکرین‌شات هنگام بستن مودال
      setScreenshotMode(false);
      setScreenshotStart(null);
      setScreenshotEnd(null);
    }
  }, [isOpen]);

  // تابع برای شروع انتخاب منطقه اسکرین‌شات
  const startScreenshot = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!screenshotMode) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    // محاسبه موقعیت موس نسبت به canvas
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setScreenshotStart({ x, y });
    setScreenshotEnd({ x, y });
  };

  // تابع برای به‌روزرسانی مستطیل انتخاب در حین حرکت موس
  const updateScreenshot = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!screenshotMode || !screenshotStart) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setScreenshotEnd({ x, y });
    
    // کشیدن مستطیل انتخاب
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // پاک کردن canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (imageRef.current) {
      // کشیدن تصویر اصلی به عنوان پس‌زمینه
      ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
    }
    
    // کشیدن مستطیل نیمه‌شفاف روی کل تصویر
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // کشیدن مستطیل انتخاب شده (شفاف)
    const selX = Math.min(screenshotStart.x, x);
    const selY = Math.min(screenshotStart.y, y);
    const selWidth = Math.abs(x - screenshotStart.x);
    const selHeight = Math.abs(y - screenshotStart.y);
    
    ctx.clearRect(selX, selY, selWidth, selHeight);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(selX, selY, selWidth, selHeight);
  };

  // تابع برای پایان دادن به انتخاب و گرفتن اسکرین‌شات
  const finishScreenshot = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!screenshotMode || !screenshotStart || !screenshotEnd) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // پاک کردن canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (imageRef.current) {
      // بازگرداندن تصویر اصلی
      ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
    }
    
    // محاسبه مختصات و ابعاد ناحیه انتخاب شده
    const x = Math.min(screenshotStart.x, screenshotEnd.x);
    const y = Math.min(screenshotStart.y, screenshotEnd.y);
    const width = Math.abs(screenshotEnd.x - screenshotStart.x);
    const height = Math.abs(screenshotEnd.y - screenshotStart.y);
    
    // اگر سایز انتخاب خیلی کوچک باشد، احتمالاً کلیک تصادفی بوده
    if (width < 10 || height < 10) {
      setScreenshotMode(false);
      setScreenshotStart(null);
      setScreenshotEnd(null);
      return;
    }
    
    // ایجاد یک canvas موقت برای گرفتن اسکرین‌شات
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx || !imageRef.current) return;
    
    // تنظیم اندازه canvas موقت
    tempCanvas.width = width;
    tempCanvas.height = height;
    
    // کپی کردن ناحیه انتخاب شده
    tempCtx.drawImage(
      canvas,
      x, y, width, height,
      0, 0, width, height
    );
    
    // ایجاد یک لینک موقت برای دانلود
    const imageData = tempCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `screenshot-region-${new Date().getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // ریست کردن حالت اسکرین‌شات
    setScreenshotMode(false);
    setScreenshotStart(null);
    setScreenshotEnd(null);
  };

  // تابع اصلی برای فعال/غیرفعال کردن حالت اسکرین‌شات
  const toggleScreenshotMode = () => {
    setScreenshotMode(prev => !prev);
  };

  // ایجاد canvas بعد از باز شدن مودال
  useEffect(() => {
    if (isOpen && canvasRef.current && imageRef.current) {
      const canvas = canvasRef.current;
      const img = imageRef.current;
      
      // منتظر لود شدن تصویر
      if (img.complete) {
        setupCanvas(canvas, img);
      } else {
        img.onload = () => setupCanvas(canvas, img);
      }
    }
  }, [isOpen]);

  // تنظیم canvas با اندازه تصویر
  const setupCanvas = (canvas: HTMLCanvasElement, img: HTMLImageElement) => {
    const rect = img.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // کشیدن تصویر اصلی روی canvas
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };

  if (!isOpen) return null;

  // استفاده از پورتال برای رندر کردن مودال در بالاترین سطح DOM
  return createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center"
      onClick={() => {
        if (!screenshotMode) {
          onClose();
        }
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <img 
          ref={imageRef}
          src={imageSrc} 
          alt="Full size image" 
          className="max-w-[90vw] max-h-[90vh] object-contain"
          style={{ display: screenshotMode ? 'none' : 'block' }}
        />
        {/* Canvas برای انتخاب منطقه اسکرین‌شات */}
        <canvas
          ref={canvasRef}
          className="max-w-[90vw] max-h-[90vh]"
          style={{ 
            display: screenshotMode ? 'block' : 'none',
            cursor: screenshotMode ? 'crosshair' : 'default'
          }}
          onMouseDown={startScreenshot}
          onMouseMove={updateScreenshot}
          onMouseUp={finishScreenshot}
          onMouseLeave={finishScreenshot}
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="bg-white text-black rounded-full p-2 hover:bg-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>,
    document.body // رندر کردن مودال مستقیماً در body صفحه
  );
};

// استایل های فارسی
const persianStyle = {
  direction: 'rtl' as const,
  textAlign: 'right' as const,
  fontFamily: 'Tahoma, Arial, sans-serif',
  lineHeight: '1.6',
  wordSpacing: '0.05rem',
  margin: '0.2rem 0',
  overflowWrap: 'break-word' as const,
  wordBreak: 'break-word' as const,
  whiteSpace: 'pre-wrap' as const,
  maxWidth: '100%',
};

const persianListStyle = {
  display: 'block',
  listStylePosition: 'inside' as const,
  paddingRight: '0.5rem', 
  marginRight: '0.5rem',
  lineHeight: '1.5',
};

// استایل‌های بهبود یافته برای عناوین
const headingStyles = {
  h1: {
    fontWeight: 'bold' as const,
    marginTop: '1.2rem',
    marginBottom: '0rem',
    color: '#b794f6',
    borderBottom: '1px solid rgba(183, 148, 246, 0.3)',
    paddingBottom: '0.05rem',
  },
  h2: {
    fontWeight: 'bold' as const,
    marginTop: '1rem',
    marginBottom: '0rem',
    color: '#b794f6',
  },
  h3: {
    fontWeight: 'bold' as const,
    marginTop: '0.8rem',
    marginBottom: '0rem',
  },
};

interface ChatMessageProps {
  text: string;
  sender: 'user' | 'ai';
  image?: string;
  audio?: string;
  fontSize?: number;
  isActionCard?: boolean;
  command?: string;
  onAccept?: () => void;
  onReject?: () => void;
}

export const ChatMessage = ({ 
  text, 
  sender, 
  image, 
  audio, 
  fontSize = 0.85, 
  isActionCard = false,
  command = '',
  onAccept = () => {},
  onReject = () => {}
}: ChatMessageProps) => {
  // state برای مدیریت وضعیت مودال تصویر
  const [imageModalOpen, setImageModalOpen] = useState(false);

  // اعمال فونت سایز به استایل ها
  const persianStyleWithFontSize = {
    ...persianStyle,
    fontSize: `${fontSize}rem`,
  };

  // اگر یک ActionCard است و فرستنده AI است
  if (isActionCard && sender === 'ai') {
    return (
      <div
        className={cn(
          "flex w-full items-start gap-2 my-2",
          "justify-end"
        )}
      >
        <ActionCard
          command={command}
          onAccept={onAccept}
          onReject={onReject}
        />
        
        <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bot className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full items-start gap-2 my-2",
        sender === 'user' ? "justify-start" : "justify-end"
      )}
    >
      {sender === 'user' && (
        <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
          <User className="h-5 w-5 text-primary-foreground" />
        </div>
      )}

      <div
        className={cn(
          "rounded-lg px-4 py-2 overflow-hidden",
          sender === 'user'
            ? "bg-primary text-primary-foreground max-w-[80%] -mt-0.5 text-sm"
            : "bg-muted max-w-[80%] -mt-0.5"
        )}
        style={{ width: 'fit-content' }}
      >
        {sender === 'ai' ? (
          <div className="ai-message w-full" style={{ ...persianStyleWithFontSize, maxWidth: '100%' }} dir="rtl">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p style={{ ...persianStyleWithFontSize, margin: '0.1rem 0 0.15rem 0' }} dir="rtl">{children}</p>,
                h1: ({ children }) => (
                  <h1 style={{ 
                    ...persianStyleWithFontSize, 
                    fontSize: `${fontSize + 0.4}rem`, 
                    ...headingStyles.h1 
                  }} dir="rtl">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 style={{ 
                    ...persianStyleWithFontSize, 
                    fontSize: `${fontSize + 0.3}rem`, 
                    ...headingStyles.h2 
                  }} dir="rtl">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 style={{ 
                    ...persianStyleWithFontSize, 
                    fontSize: `${fontSize + 0.2}rem`, 
                    ...headingStyles.h3
                  }} dir="rtl">{children}</h3>
                ),
                h4: ({ children }) => <h4 style={{ ...persianStyleWithFontSize, fontSize: `${fontSize + 0.1}rem`, fontWeight: 'bold', margin: '0.8rem 0 0rem 0' }} dir="rtl">{children}</h4>,
                h5: ({ children }) => <h5 style={{ ...persianStyleWithFontSize, fontWeight: 'bold', margin: '0.7rem 0 0rem 0' }} dir="rtl">{children}</h5>,
                h6: ({ children }) => <h6 style={{ ...persianStyleWithFontSize, fontWeight: 'bold', margin: '0.6rem 0 0rem 0' }} dir="rtl">{children}</h6>,
                ul: ({ children }) => <ul style={{ ...persianStyleWithFontSize, ...persianListStyle, listStyleType: 'disc', margin: '0.1rem 0 0.4rem 0' }} dir="rtl">{children}</ul>,
                ol: ({ children }) => <ol style={{ ...persianStyleWithFontSize, ...persianListStyle, listStyleType: 'decimal', margin: '0.1rem 0 0.4rem 0' }} dir="rtl">{children}</ol>,
                li: ({ children }) => <li style={{ ...persianStyleWithFontSize, display: 'list-item', margin: '0.05rem 0 0.1rem 0', paddingRight: '0.2rem' }} dir="rtl">{children}</li>,
                blockquote: ({ children }) => <blockquote style={{ ...persianStyleWithFontSize, borderRight: '4px solid #b794f6', paddingRight: '0.75rem', fontStyle: 'italic', margin: '0.2rem 0 0.4rem 0', backgroundColor: 'rgba(183, 148, 246, 0.05)' }} dir="rtl">{children}</blockquote>,
                code: ({ className, children }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  return match ? (
                    <pre style={{ direction: 'ltr', textAlign: 'left', overflow: 'auto', maxWidth: '100%', backgroundColor: '#1a1a1a', padding: '0.5rem', borderRadius: '0.25rem', margin: '0.2rem 0' }}>
                      <code className={className}>
                        {children}
                      </code>
                    </pre>
                  ) : (
                    <code className={className} style={{ direction: 'ltr', textAlign: 'left', backgroundColor: 'rgba(0,0,0,0.1)', padding: '0.1rem 0.3rem', borderRadius: '0.25rem' }}>
                      {children}
                    </code>
                  );
                },
                // اضافه کردن استایل برای تگ strong (متن پررنگ)
                strong: ({ children }) => <strong style={{ fontWeight: 'bold', color: '#b794f6' }}>{children}</strong>,
                // اضافه کردن استایل برای تگ em (متن مورب)
                em: ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
                // کاهش مارجین برای فاصله کمتر بین پاراگراف‌ها
                br: () => <br style={{ display: 'block', margin: '0.1rem 0' }} />,
              }}
            >
              {text}
            </ReactMarkdown>
          </div>
        ) : (
          <div style={{ fontSize: `${fontSize}rem` }}>{text}</div>
        )}
        {image && (
          <>
            <img
              src={image}
              alt="Uploaded content"
              className="mt-2 rounded-md max-w-full cursor-pointer"
              style={{ maxWidth: '300px', maxHeight: '200px', objectFit: 'contain' }}
              onClick={() => setImageModalOpen(true)}
            />
            <ImageModal 
              isOpen={imageModalOpen} 
              onClose={() => setImageModalOpen(false)} 
              imageSrc={image} 
            />
          </>
        )}
        {audio && (
          <audio controls className="mt-2 w-full">
            <source src={audio} type="audio/wav" />
            Your browser does not support the audio element.
          </audio>
        )}
      </div>

      {sender === 'ai' && (
        <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bot className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};