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
import { getOcrTextFromSupabase, saveOcrTextToSupabase, saveHighlightsToSupabase, getHighlightsFromSupabase, HighlightsMap } from '@/services/ocrStorageService';
import { getHighlightsFromAI, isHighlightRequest } from '@/services/highlightService';
import { extractTextFromPdfWithOCR } from '@/services/geminiService';
import { v4 as uuid } from 'uuid';

// تابع کمکی برای تشخیص درخواست‌های مربوط به صفحه خاص
const isPageRequest = (text: string): number | null => {
  // الگوهای مختلف درخواست صفحه
  const patterns = [
    /(?:صفحه|page)\s+(\d+)/i,                                // صفحه 5، page 5
    /(?:صفحه|page)\s+(\d+)\s+(?:را)?(?:\s+بهم)?\s+(?:بگو|بده)/i,  // صفحه 5 را بهم بگو، صفحه 5 بده
    /(?:برو|برویم|برگرد)(?:\s+به)?\s+(?:صفحه|page)\s+(\d+)/i      // برو به صفحه 5، برگرد صفحه ۳
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
  }

  return null;
};

interface Message {
  text: string;
  sender: 'user' | 'ai';
  image?: string;
  audio?: string;
  isActionCard?: boolean;
  command?: string;
  actionState?: 'pending' | 'accepted' | 'rejected';
}

interface PDFChatInterfaceProps {
  resourceId: string;
  drawingImage?: string;
  screenshotImage?: string;
  viewMode?: 'chat' | 'transcript' | 'dual';
  initialView?: 'chat' | 'transcript' | 'dual';
  onViewModeChange?: (mode: 'chat' | 'transcript' | 'dual') => void;
  onHighlightsChange?: (words: Array<{text: string, type: string}>, page: number | null) => void;
}

export const PDFChatInterface = ({ 
  resourceId, 
  drawingImage, 
  screenshotImage,
  onHighlightsChange
}: PDFChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [webBrowsingEnabled, setWebBrowsingEnabled] = useState(false);
  const [academicSearchEnabled, setAcademicSearchEnabled] = useState(false);
  const [pdfText, setPdfText] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [fontSize, setFontSize] = useState(0.85);
  
  // اضافه کردن state برای نگهداری درصد پیشرفت OCR
  const [ocrProgress, setOcrProgress] = useState(0);
  
  // برای نگهداری وضعیت پیش‌نویس تصاویر
  const [draftImages, setDraftImages] = useState<string[]>([]);
  const [showDraft, setShowDraft] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // برای ذخیره درخواست هایلایت فعلی
  const [highlightRequest, setHighlightRequest] = useState<string>('');
  
  // تغییر روش ذخیره هایلایت‌ها به صورت یک آبجکت با کلید شماره صفحه
  const [highlights, setHighlights] = useState<{
    [page: number]: Array<{text: string, type: string}>
  }>({});
  
  // صفحه فعلی هایلایت
  const [highlightPage, setHighlightPage] = useState<number | null>(null);

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
  
  // اضافه کردن useEffect برای OCR خودکار
  useEffect(() => {
    const initializePdf = async () => {
      if (!resourceId) return;
      
      setPdfLoading(true);
      try {
        // دریافت URL فایل PDF
        const pdfUrl = await retrievePdf(resourceId, '');
        if (!pdfUrl) {
          throw new Error('فایل PDF یافت نشد');
        }

        // استخراج متن از PDF
        const extractedText = await extractTextFromPdf(pdfUrl);
        setPdfText(extractedText);

        // ذخیره متن در حافظه محلی
        await cachePdfText(resourceId, extractedText);

        // بررسی آیا متن OCR قبلاً استخراج شده است
        const existingOcrText = await getOcrTextFromSupabase(resourceId);
        if (existingOcrText) {
          console.log('OCR text already exists, skipping OCR process');
        } else {
          // انجام OCR خودکار فقط اگر قبلاً انجام نشده باشد
          console.log('No OCR text found, starting automatic OCR...');
          const ocrText = await performOcr(pdfUrl, (progress) => {
            console.log(`OCR progress: ${progress}%`);
          });
          if (ocrText) {
            console.log('OCR completed successfully');
          }
        }
        
        // بارگیری هایلایت‌های ذخیره شده
        const savedHighlights = await getHighlightsFromSupabase(resourceId);
        if (Object.keys(savedHighlights).length > 0) {
          console.log('Loaded highlights from Supabase:', savedHighlights);
          setHighlights(savedHighlights);
        }
      } catch (error) {
        console.error('Error initializing PDF:', error);
        toast.error('خطا در بارگذاری PDF');
      } finally {
        setPdfLoading(false);
      }
    };

    initializePdf();
  }, [resourceId]);

  // اطلاع رسانی به کامپوننت پدر هنگام تغییر هایلایت‌ها
  useEffect(() => {
    if (onHighlightsChange && highlightPage !== null) {
      const currentPageHighlights = highlights[highlightPage] || [];
      onHighlightsChange(currentPageHighlights, highlightPage);
    }
  }, [highlights, highlightPage, onHighlightsChange]);

  // پردازش درخواست هایلایت
  const processHighlightRequest = async (text: string, page: number | null) => {
    // ایجاد یک toast با ID برای اطمینان از dismiss شدن
    const loadingToastId = toast.loading('در حال پردازش متن...');
    
    try {
      console.log('Processing highlight request:', text, 'Page:', page);
      
      // ابتدا باید OCR text را بخوانیم
      const ocrText = await getOcrTextFromSupabase(resourceId);
      if (!ocrText) {
        toast.error('محتوای transcript یافت نشد. لطفاً ابتدا فایل را OCR کنید.');
        return false;
      }
      
      // اگر شماره صفحه مشخص نشده، پیام خطا نمایش دهیم
      if (!page) {
        toast.error('لطفاً شماره صفحه را برای هایلایت مشخص کنید.');
        return false;
      }
      
      // استخراج متن صفحه مورد نظر با استفاده از روش یکسان با PDFTranscriptView
      const pageTexts = ocrText.split(/===== صفحه \d+ =====/)
        .filter(p => p.trim().length > 0); // حذف صفحات خالی
      
      console.log(`Found ${pageTexts.length} transcript pages for highlighting`);
      
      // بررسی معتبر بودن شماره صفحه
      if (page < 1 || page > pageTexts.length) {
        toast.error(`شماره صفحه ${page} معتبر نیست. تعداد کل صفحات: ${pageTexts.length}`);
        return false;
      }
      
      // متن صفحه مورد نظر
      const pageText = pageTexts[page - 1];
      
      // ارسال به Gemini API
      console.log('Sending to Gemini API...');
      const pageHighlights = await getHighlightsFromAI(pageText, text);
      console.log('Received highlights:', pageHighlights);
      
      if (!pageHighlights || pageHighlights.length === 0) {
        toast.warning('هیچ متنی برای هایلایت پیدا نشد.');
        return false;
      }
      
      // ذخیره هایلایت‌ها برای صفحه مشخص شده
      const updatedHighlights = {
        ...highlights,
        [page]: pageHighlights
      };
      
      setHighlights(updatedHighlights);
      
      // ذخیره هایلایت‌ها در Supabase
      await saveHighlightsToSupabase(resourceId, updatedHighlights);
      console.log('Highlights saved to Supabase');
      
      // تنظیم صفحه فعلی هایلایت
      setHighlightPage(page);
      
      // اطلاع‌رسانی به کامپوننت والد برای نمایش هایلایت‌ها
      if (onHighlightsChange) {
        console.log(`Notifying parent component of ${pageHighlights.length} highlights on page ${page}`);
        onHighlightsChange(pageHighlights, page);
      }
      
      // اضافه کردن پیام پاسخ به چت
      const responseMessage: Message = {
        text: `${pageHighlights.length} مورد در صفحه ${page} هایلایت شد.`,
        sender: 'ai'
      };
      
      setMessages(prev => [...prev, responseMessage]);
      
      return true;
    } catch (error) {
      console.error('Error processing highlight request:', error);
      toast.error(`خطا در انجام هایلایت: ${error instanceof Error ? error.message : 'خطای ناشناخته'}`);
      return false;
    } finally {
      // مطمئن شویم که toast.loading حتماً بسته می‌شود
      toast.dismiss(loadingToastId);
    }
  };

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

    // بررسی درخواست هایلایت
    const { isHighlight, pageNumber } = isHighlightRequest(text);
    if (isHighlight) {
      console.log('Highlight request detected!', { pageNumber });
      
      if (!pageNumber) {
        const aiMessage: Message = {
          text: 'لطفاً شماره صفحه را برای هایلایت مشخص کنید. مثال: "نکات مهم صفحه ۵ را هایلایت کن"',
          sender: 'ai'
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
        return;
      }
      
      // ذخیره درخواست هایلایت و نمایش ActionCard
      setHighlightRequest(text);
      
      const aiMessage: Message = {
        text: '',
        sender: 'ai',
        isActionCard: true,
        command: `هایلایت: ${text}`
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
      return;
    }

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
    
    // بررسی درخواست‌های مربوط به transcript
    const transcriptPageRegex = /(?:transcript|ترنسکریپت)(?:\s+(?:صفحه|page))?\s+(\d+)|(?:صفحه|page)\s+(\d+)(?:\s+(?:را)?(?:\s+بهم)?(?:\s+بگو)?)?\s+(?:transcript|ترنسکریپت)/i;
    const transcriptMatch = text.match(transcriptPageRegex);
    
    // اضافه کردن تشخیص برای حالت‌های دیگر درخواست ترنسکریپت به فارسی
    const isFarsiTranscriptRequest = /صفحه.*(?:ترنسکریپت|transcript)|(?:متن|محتوا).*(?:ترنسکریپت|transcript)|(?:ترنسکریپت|transcript).*(?:متن|محتوا)/i.test(text);
    const isSimplePageRequest = isPageRequest(text);
    
    console.log('Request analysis:', { 
      text, 
      transcriptMatch, 
      isFarsiTranscriptRequest,
      isSimplePageRequest,
      hasTranscriptWord: text.toLowerCase().includes('transcript') || text.includes('ترنسکریپت')
    });
    
    const isTranscriptRequest = transcriptMatch || 
                               isFarsiTranscriptRequest || 
                               text.toLowerCase().includes('transcript') || 
                               text.includes('ترنسکریپت') ||
                               isSimplePageRequest !== null;
    
    if (isTranscriptRequest) {
      try {
        console.log('Processing transcript request');
        // بارگیری متن OCR شده از سرور
        const ocrText = await getOcrTextFromSupabase(resourceId);
        console.log('Loaded OCR text:', !!ocrText);
        
        if (!ocrText) {
          const noTranscriptMessage: Message = {
            text: "متأسفانه هنوز ترنسکریپتی برای این فایل ایجاد نشده است. لطفاً ابتدا از طریق منوی 'Transcript' فایل را OCR کنید.",
            sender: 'ai'
          };
          setMessages(prev => [...prev, noTranscriptMessage]);
          setIsLoading(false);
          return;
        }
        
        // افزودن گزارش اشکال‌زدایی
        console.log(`OCR text from Supabase, total length: ${ocrText.length} characters`);
        const pageMarkers = (ocrText.match(/===== صفحه \d+ =====/g) || []);
        console.log(`Page markers in Supabase text: ${pageMarkers.length}`);
        console.log(`First 3 markers: ${pageMarkers.slice(0, 3).join(', ')}`);
        console.log(`Last 3 markers: ${pageMarkers.slice(-3).join(', ')}`);
        
        // بهبود جداسازی صفحات با استفاده از الگوی دقیق‌تر
        const pageTexts = ocrText.split(/===== صفحه \d+ =====/)
          .filter(page => page.trim().length > 0); // حذف صفحات خالی
          
        console.log(`Found ${pageTexts.length} transcript pages after filtering empty pages`);
        
        let pageNumber = -1;
        
        // اگر شماره صفحه مشخص شده است - با پشتیبانی از الگوهای مختلف
        if (transcriptMatch) {
          // پیدا کردن شماره صفحه از گروه‌های منظم
          pageNumber = parseInt(transcriptMatch[1] || transcriptMatch[2], 10);
          console.log(`Extracted page number from transcript regex: ${pageNumber}`);
        } else if (isSimplePageRequest !== null) {
          // استفاده از نتیجه تابع isPageRequest
          pageNumber = isSimplePageRequest;
          console.log(`Extracted page number from simple page request: ${pageNumber}`);
        } else {
          // برای تشخیص شماره صفحه در متن‌های فارسی دیگر
          const pageNumberMatch = text.match(/صفحه\s*(\d+)/i);
          if (pageNumberMatch && pageNumberMatch[1]) {
            pageNumber = parseInt(pageNumberMatch[1], 10);
            console.log(`Extracted page number from farsi text: ${pageNumber}`);
          }
        }
        
        // اگر شماره صفحه پیدا شد و معتبر است
        if (pageNumber > 0 && pageNumber <= pageTexts.length) {
          // نمایش ActionCard برای درخواست ترنسکریپت
          const aiMessage: Message = {
            text: '',
            sender: 'ai',
            isActionCard: true,
            command: `ترنسکریپت: صفحه ${pageNumber}`
          };
          
          setMessages(prev => [...prev, aiMessage]);
          // تنظیم درخواست ترنسکریپت برای استفاده در هنگام تأیید
          setHighlightRequest(text);
          
          // دیگر هایلایت‌ها را پاک نمی‌کنیم، فقط صفحه فعلی را تغییر می‌دهیم
          setHighlightPage(pageNumber);
          
          // ارسال اطلاعات به کامپوننت والد برای نمایش صفحه transcript
          if (onHighlightsChange) {
            console.log(`Notifying parent component to show page ${pageNumber}`);
            // استفاده از هایلایت‌های موجود برای صفحه مورد نظر یا آرایه خالی اگر وجود ندارد
            const pageHighlights = highlights[pageNumber] || [];
            onHighlightsChange(pageHighlights, pageNumber);
          }
        } else if (pageNumber > 0) {
          // شماره صفحه خارج از محدوده است
          const errorMessage: Message = {
            text: `خطا: صفحه ${pageNumber} خارج از محدوده است. این فایل دارای ${pageTexts.length} صفحه است.`,
            sender: 'ai'
          };
          
          setMessages(prev => [...prev, errorMessage]);
        } else {
          // اگر فقط کلمه transcript درخواست شده، اطلاعات کلی را برگردان
          const infoMessage: Message = {
            text: `این فایل دارای ${pageTexts.length} صفحه ترنسکریپت است. برای مشاهده متن هر صفحه، عبارت "transcript صفحه X" یا "صفحه X را ترنسکریپت بگو" یا حتی فقط "صفحه X" را وارد کنید (به جای X شماره صفحه را بنویسید).`,
            sender: 'ai'
          };
          
          setMessages(prev => [...prev, infoMessage]);
        }
      } catch (error) {
        console.error('Error fetching transcript:', error);
        const errorMessage: Message = {
          text: `خطا در بازیابی ترنسکریپت: ${error instanceof Error ? error.message : 'خطای ناشناخته'}`,
          sender: 'ai'
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      if (!pdfText) {
        throw new Error('محتوای PDF در دسترس نیست');
      }
      
      // استفاده از Gemini API برای پاسخگویی با توجه به محتوای PDF
      const response = await generatePdfResponse(pdfText, text, undefined, resourceId);
      
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
  const handleAcceptCommand = async (command: string) => {
    console.log(`دستور پذیرفته شد: ${command}`);
    
    // بروزرسانی وضعیت پیام مربوطه به 'accepted'
    setMessages(prev => prev.map(msg => 
      msg.isActionCard && msg.command === command 
        ? { ...msg, actionState: 'accepted' as const } 
        : msg
    ));
    
    // بررسی آیا دستور از نوع هایلایت است
    if (command.startsWith('هایلایت:')) {
      // استخراج متن درخواست هایلایت
      const userQuery = highlightRequest || command.replace('هایلایت:', '').trim();
      
      // استخراج شماره صفحه از متن
      const { pageNumber } = isHighlightRequest(userQuery);
      
      if (pageNumber) {
        // اعلام به کاربر که در حال پردازش هستیم
        const toastId = toast.loading('در حال پردازش درخواست هایلایت...');
        setIsLoading(true);
        
        try {
          // پردازش درخواست هایلایت
          const success = await processHighlightRequest(userQuery, pageNumber);
          
          if (success) {
            toast.success('متن با موفقیت هایلایت شد');
          }
        } catch (error) {
          console.error('Error processing highlight:', error);
          toast.error(`خطا در هایلایت متن: ${error instanceof Error ? error.message : 'خطای ناشناخته'}`);
        } finally {
          // مطمئن شویم که toast.loading حتماً بسته می‌شود
          toast.dismiss(toastId);
          setIsLoading(false);
        }
      } else {
        toast.error('شماره صفحه برای هایلایت مشخص نشده است');
      }
    } 
    // بررسی آیا دستور از نوع ترنسکریپت است
    else if (command.startsWith('ترنسکریپت:')) {
      // استخراج شماره صفحه از دستور
      const pageMatch = command.match(/صفحه\s*(\d+)/i);
      if (pageMatch && pageMatch[1]) {
        const pageNumber = parseInt(pageMatch[1], 10);
        setIsLoading(true);
        
        try {
          // بارگیری متن OCR شده از سرور
          const ocrText = await getOcrTextFromSupabase(resourceId);
          
          if (!ocrText) {
            toast.error('محتوای transcript یافت نشد.');
            setIsLoading(false);
            return;
          }
          
          // تقسیم متن به صفحات با استفاده از روش یکسان
          const pageTexts = ocrText.split(/===== صفحه \d+ =====/)
            .filter(page => page.trim().length > 0); // حذف صفحات خالی
          
          console.log(`Found ${pageTexts.length} transcript pages for command ${command}`);
          
          // بررسی اعتبار شماره صفحه
          if (pageNumber > 0 && pageNumber <= pageTexts.length) {
            const pageContent = pageTexts[pageNumber - 1].trim();
            
            // تنظیم صفحه ترنسکریپت بدون پاک کردن هایلایت‌های قبلی
            setHighlightPage(pageNumber);
            
            // ارسال اطلاعات به کامپوننت والد با حفظ هایلایت‌های صفحه
            if (onHighlightsChange) {
              console.log(`Notifying parent component to show page ${pageNumber}`);
              const pageHighlights = highlights[pageNumber] || [];
              onHighlightsChange(pageHighlights, pageNumber);
            }
            
            // ارسال پاسخ به کاربر
            const responseMessage: Message = {
              text: `## ترنسکریپت صفحه ${pageNumber}:\n\n${pageContent}`,
              sender: 'ai'
            };
            
            setMessages(prev => [...prev, responseMessage]);
            toast.success(`ترنسکریپت صفحه ${pageNumber} با موفقیت نمایش داده شد`);
          } else {
            toast.error(`شماره صفحه ${pageNumber} خارج از محدوده است. این فایل دارای ${pageTexts.length} صفحه است.`);
          }
        } catch (error) {
          console.error('Error fetching transcript:', error);
          toast.error(`خطا در بازیابی ترنسکریپت: ${error instanceof Error ? error.message : 'خطای ناشناخته'}`);
        } finally {
          setIsLoading(false);
        }
      } else {
        toast.error('شماره صفحه برای ترنسکریپت مشخص نشده است');
      }
    }
    else {
      toast.success(`دستور "${command}" پذیرفته شد`);
    }
  };

  const handleRejectCommand = () => {
    console.log('دستور رد شد');
    
    // بروزرسانی آخرین پیام اکشن کارت به 'rejected'
    setMessages(prev => {
      const lastActionCardIndex = [...prev].reverse().findIndex(msg => msg.isActionCard);
      if (lastActionCardIndex >= 0) {
        const updatedMessages = [...prev];
        const actualIndex = prev.length - 1 - lastActionCardIndex;
        updatedMessages[actualIndex] = { 
          ...updatedMessages[actualIndex], 
          actionState: 'rejected' as const 
        };
        return updatedMessages;
      }
      return prev;
    });
    
    // پاک کردن هایلایت‌ها اگر درخواست هایلایت رد شده است
    if (highlightRequest) {
      setHighlightRequest('');
    }
    toast.info('دستور رد شد');
  };

  // تابع OCR
  const performOcr = async (pdfUrl: string, onProgress?: (progress: number) => void): Promise<string | null> => {
    try {
      console.log('Starting OCR process...');
      // آپدیت تابع onProgress برای به‌روزرسانی state درصد پیشرفت
      const ocrText = await extractTextFromPdfWithOCR(pdfUrl, (progress) => {
        setOcrProgress(progress);
        if (onProgress) onProgress(progress);
      });
      
      if (ocrText) {
        console.log('OCR completed successfully');
        
        // افزودن گزارش اشکال‌زدایی برای بررسی تعداد صفحات و ساختار متن
        const pageSeparator = "===== صفحه ";
        const pageMarkers = (ocrText.match(/===== صفحه \d+ =====/g) || []);
        console.log(`Page markers found: ${pageMarkers.length}`);
        console.log(`First 3 markers: ${pageMarkers.slice(0, 3).join(', ')}`);
        console.log(`Last 3 markers: ${pageMarkers.slice(-3).join(', ')}`);
        
        // روش بهتر جداسازی صفحات
        const pageTexts = ocrText.split(/===== صفحه \d+ =====/)
          .filter(page => page.trim().length > 0); // حذف صفحات خالی
        
        console.log(`Page texts after split: ${pageTexts.length}`);
        console.log(`OCR text total length: ${ocrText.length} characters`);
        
        // ذخیره متن OCR شده در Supabase
        await saveOcrTextToSupabase(resourceId, ocrText);
        return ocrText;
      }
      
      throw new Error('خطا در انجام OCR');
    } catch (error) {
      console.error('Error performing OCR:', error);
      toast.error('خطا در انجام OCR');
      return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {pdfLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
          <div className="flex flex-col items-center gap-4 max-w-md w-full p-6 rounded-lg bg-background shadow-lg">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="w-full" dir="rtl" style={{ direction: 'rtl', textAlign: 'right' }}>
              <div className="text-sm text-muted-foreground mb-2 font-medium">در حال استخراج متن از PDF...</div>
              <div className="w-full bg-muted rounded-full h-2.5 mb-1">
                <div 
                  className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${ocrProgress}%` }}
                ></div>
              </div>
              <div className="text-xs text-muted-foreground">تکمیل شده {ocrProgress}%</div>
            </div>
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