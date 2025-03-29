import { useState, useEffect, useRef } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Image, Mic, Loader2, Bot, ChevronUp, ChevronDown, Type, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Globe, GraduationCap } from "lucide-react";
import { ChatMessage, ImageModal } from './chat/ChatMessage';
import { ChatWelcome } from './chat/ChatWelcome';
import { extractTextFromPdf, generatePdfResponse, getCachedPdfText, cachePdfText } from '@/services/pdfChatService';
import { retrievePdf } from '@/utils/pdfStorage';
import { toast } from "sonner";
import ActionCard from './ui/ActionCard';

interface Message {
  text: string;
  sender: 'user' | 'ai';
  image?: string;
  audio?: string;
  isActionCard?: boolean;
  command?: string;
}

interface PDFChatInterfaceProps {
  resourceId: string;
  drawingImage?: string;
  screenshotImage?: string;
}

export const PDFChatInterface = ({ resourceId, drawingImage, screenshotImage }: PDFChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [webBrowsingEnabled, setWebBrowsingEnabled] = useState(false);
  const [academicSearchEnabled, setAcademicSearchEnabled] = useState(false);
  const [pdfText, setPdfText] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [fontSize, setFontSize] = useState(0.85);
  
  // برای نگهداری وضعیت پیش‌نویس تصاویر
  const [draftImages, setDraftImages] = useState<string[]>([]);
  const [showDraft, setShowDraft] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // اضافه کردن تصویر نقاشی به draft هر وقت که تغییر کند
  useEffect(() => {
    if (drawingImage) {
      console.log('New drawing image received! Adding to drafts...');
      setDraftImages(prev => [...prev, drawingImage]);
      setShowDraft(true);
    }
  }, [drawingImage]);

  // اضافه کردن تصویر اسکرین‌شات به draft هر وقت که تغییر کند
  useEffect(() => {
    if (screenshotImage) {
      console.log('New screenshot image received! Adding to drafts...');
      setDraftImages(prev => [...prev, screenshotImage]);
      setShowDraft(true);
    }
  }, [screenshotImage]);

  // استخراج متن PDF در هنگام بارگذاری کامپوننت
  useEffect(() => {
    const loadPdfText = async () => {
      if (!resourceId) return;
      
      try {
        setPdfLoading(true);
        
        // ابتدا از حافظه محلی بررسی می‌کنیم
        const cachedText = getCachedPdfText(resourceId);
        if (cachedText) {
          console.log('Using cached PDF text');
          setPdfText(cachedText);
          setPdfLoading(false);
          return;
        }
        
        // دریافت URL فایل PDF
        const pdfUrl = await retrievePdf(resourceId, '');
        if (!pdfUrl) {
          throw new Error('PDF URL not found');
        }
        
        // استخراج متن از PDF
        const extractedText = await extractTextFromPdf(pdfUrl);
        setPdfText(extractedText);
        
        // ذخیره در حافظه محلی برای استفاده‌های بعدی
        cachePdfText(resourceId, extractedText);
        
      } catch (error) {
        console.error('Error loading PDF text:', error);
        toast.error('خطا در بارگذاری محتوای PDF');
      } finally {
        setPdfLoading(false);
      }
    };
    
    loadPdfText();
  }, [resourceId]);

  const handleSendMessage = async (text: string) => {
    if (text.trim() === '') return;
    
    // بررسی آیا پیام تصویری یا صوتی است
    if (draftImages.length > 0) {
      const userMessage: Message = {
        text,
        sender: 'user',
        image: draftImages[0]
      };
      
      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);

      try {
        // در اینجا می‌توانید از یک API برای تحلیل تصویر استفاده کنید
        const aiMessage: Message = {
          text: 'سلام! تصویر شما دریافت شد. چه کمکی می‌توانم بکنم؟',
          sender: 'ai'
        };
        
        setMessages(prev => [...prev, aiMessage]);
      } catch (error) {
        console.error('Error processing image:', error);
        
        const errorMessage: Message = {
          text: `خطا در پردازش تصویر: ${error instanceof Error ? error.message : 'خطای ناشناخته'}`,
          sender: 'ai'
        };
        
        setMessages(prev => [...prev, errorMessage]);
        toast.error('خطا در دریافت پاسخ از هوش مصنوعی');
      } finally {
        setIsLoading(false);
      }
      
      // پاک کردن پیش‌نویس بعد از ارسال
      setDraftImages([]);
      setShowDraft(false);
      setMessage('');
      return;
    }

    const userMessage: Message = {
      text,
      sender: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setMessage('');

    // بررسی آیا "action card" درخواست شده است
    if (text.toLowerCase().includes('action card')) {
      // افزودن تاخیر کوتاه برای واقعی‌تر بودن تجربه کاربر
      setTimeout(() => {
        const aiMessage: Message = {
          text: '',  // متن خالی برای ActionCard
          sender: 'ai',
          isActionCard: true,
          command: 'npm run dev'  // دستور پیش‌فرض
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
      }, 1000);
      return;
    }

    try {
      if (!pdfText) {
        throw new Error('محتوای PDF در دسترس نیست');
      }
      
      // استفاده از Gemini API برای پاسخگویی با توجه به محتوای PDF
      const response = await generatePdfResponse(pdfText, text);
      
      const aiMessage: Message = {
        text: response,
        sender: 'ai'
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      
      const errorMessage: Message = {
        text: `خطا در پردازش درخواست: ${error instanceof Error ? error.message : 'خطای ناشناخته'}`,
        sender: 'ai'
      };
      
      setMessages(prev => [...prev, errorMessage]);
      toast.error('خطا در دریافت پاسخ از هوش مصنوعی');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelDraft = () => {
    // لغو و پاک کردن همه پیش‌نویس‌ها
    setDraftImages([]);
    setShowDraft(false);
  };

  const handleRemoveDraftImage = (indexToRemove: number) => {
    setDraftImages(prev => prev.filter((_, index) => index !== indexToRemove));
    if (draftImages.length <= 1) {
      setShowDraft(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(message);
    }
  };

  const handleSendImage = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const userMessage: Message = {
        text: "", // حذف متن
        sender: 'user',
        image: e.target?.result as string
      };
      setMessages(prev => [...prev, userMessage]);
    };
    reader.readAsDataURL(file);
  };

  const handleSendVoice = async (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const userMessage: Message = {
      text: "Sent a voice message",
      sender: 'user',
      audio: url
    };
    setMessages(prev => [...prev, userMessage]);
  };

  // توابع مربوط به ActionCard
  const handleAcceptCommand = (command: string) => {
    console.log(`دستور پذیرفته شد: ${command}`);
    toast.success(`دستور "${command}" پذیرفته شد`);
    // اینجا می‌توانید دستور را اجرا کنید
  };

  const handleRejectCommand = () => {
    console.log('دستور رد شد');
    toast.info('دستور رد شد');
  };

  return (
    <div className="flex flex-col h-full">
      {pdfLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">در حال استخراج متن از PDF...</span>
          </div>
        </div>
      )}
      
      <ScrollArea className="flex-1 pt-0 pb-2 px-4">
        {messages.length === 0 ? (
          <ChatWelcome onSuggestionClick={handleSendMessage} />
        ) : (
          <div className="space-y-2">
            {messages.map((msg, index) => (
              <ChatMessage 
                key={index} 
                {...msg} 
                fontSize={fontSize}
                onAccept={msg.isActionCard ? () => handleAcceptCommand(msg.command || '') : undefined}
                onReject={msg.isActionCard ? handleRejectCommand : undefined}
              />
            ))}
            {isLoading && (
              <div className="flex items-center justify-end space-x-2 text-muted-foreground my-2">
                <div className="bg-muted rounded-lg px-4 py-2 max-w-[80%] flex items-center -mt-0.5 rtl text-right">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <div className="animate-bounce">●</div>
                    <div className="animate-bounce delay-100">●</div>
                    <div className="animate-bounce delay-200">●</div>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <div className="border-t p-4 bg-background/95 backdrop-blur-sm space-y-2">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <div className="flex items-center gap-2 bg-muted/50 rounded-md px-2 py-1">
            <Globe className="h-4 w-4" />
            <span className="text-xs">Web Browsing</span>
            <Switch
              checked={webBrowsingEnabled}
              onCheckedChange={setWebBrowsingEnabled}
              className="scale-75"
            />
          </div>

          <div className="flex items-center gap-2 bg-muted/50 rounded-md px-2 py-1">
            <GraduationCap className="h-4 w-4" />
            <span className="text-xs">Search Academic Papers</span>
            <Switch
              checked={academicSearchEnabled}
              onCheckedChange={setAcademicSearchEnabled}
              className="scale-75"
            />
          </div>
          
          <div className="flex items-center gap-2 bg-muted/50 rounded-md px-2 py-1">
            <Type className="h-4 w-4" />
            <span className="text-xs">اندازه فونت</span>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setFontSize(prev => Math.max(prev - 0.05, 0.6))}
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
              <span className="text-xs mx-1">{(fontSize * 100).toFixed(0)}%</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setFontSize(prev => Math.min(prev + 0.05, 1.2))}
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {showDraft && draftImages.length > 0 && (
          <div className="max-w-3xl mx-auto bg-muted/30 rounded-lg p-2 mb-2 flex items-start gap-2 flex-wrap">
            {draftImages.map((image, index) => (
              <div key={index} className="relative">
                <button 
                  onClick={() => setSelectedImage(image)} 
                  className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border border-muted-foreground/20 hover:opacity-90 transition-opacity"
                >
                  <img src={image} alt={`پیش‌نمایش ${index+1}`} className="w-full h-full object-cover" />
                </button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 rounded-full bg-black/50 hover:bg-black/70" 
                  onClick={() => handleRemoveDraftImage(index)}
                >
                  <X className="h-3 w-3 text-white" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* نمایش مودال تصویر - خارج از جریان JSX اصلی */}
        {selectedImage && (
          <ImageModal 
            isOpen={!!selectedImage} 
            onClose={() => setSelectedImage(null)} 
            imageSrc={selectedImage} 
          />
        )}

        <div className="max-w-3xl mx-auto flex items-center gap-2 bg-muted rounded-lg p-2">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 hover:bg-background/50"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) handleSendImage(file);
              };
              input.click();
            }}
          >
            <Image className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 hover:bg-background/50"
            onClick={() => {
              // Handle voice recording
              handleSendVoice(new Blob());
            }}
          >
            <Mic className="h-5 w-5" />
          </Button>
          <Textarea
            placeholder={pdfLoading ? "در حال آماده‌سازی..." : (showDraft ? "متن همراه با تصویر را وارد کنید..." : "سوال خود را از هوش مصنوعی بپرسید...")}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[44px] resize-none bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
            rows={1}
            disabled={pdfLoading || !pdfText}
            dir="rtl"
          />
          <Button
            onClick={() => handleSendMessage(message)}
            size="icon"
            className={cn(
              "shrink-0",
              ((!message.trim() && draftImages.length === 0) || isLoading || pdfLoading || !pdfText) && "opacity-50 cursor-not-allowed"
            )}
            disabled={(!message.trim() && draftImages.length === 0) || isLoading || pdfLoading || !pdfText}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};