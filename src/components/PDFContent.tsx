import { PDFViewer } from "./PDFViewer";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { PDFChatHeader } from "@/components/pdf/PDFChatHeader";
import { PDFViewerNav } from "./PDFViewerNav";
import { useState } from "react";
import { PDFChatInterface } from "./PDFChatInterface";
import { PDFTranscriptView } from "@/components/PDFTranscriptView";

interface PDFContentProps {
  currentView: 'chat' | 'notes' | 'pdf' | 'transcript' | 'jozveh' | 'dual' | 'quiz' | 'flashcards' | 'mindmap' | 'matchgame' | 'home' | 'teach';
  resourceId: string;
  displayName: string;
  onViewChange: (view: 'chat' | 'notes' | 'pdf' | 'transcript' | 'jozveh' | 'dual' | 'quiz' | 'flashcards' | 'mindmap' | 'matchgame' | 'home' | 'teach') => void;
}

export const PDFContent: React.FC<PDFContentProps> = ({ currentView, resourceId, displayName, onViewChange }) => {
  // این state برای ذخیره آخرین تصویر نقاشی استفاده می‌شود
  const [drawingImage, setDrawingImage] = useState<string | undefined>(undefined);
  // اضافه کردن state برای ذخیره تصویر اسکرین‌شات
  const [screenshotImage, setScreenshotImage] = useState<string | undefined>(undefined);
  // تغییر ساختار ذخیره‌سازی هایلایت‌ها به صورت آبجکتی با کلید شماره صفحه
  const [highlights, setHighlights] = useState<{
    [page: number]: Array<{text: string, type: string}>
  }>({});
  const [highlightPage, setHighlightPage] = useState<number | null>(null);

  const handleDrawingComplete = (imageData: string) => {
    console.log('Drawing completed, sending to chat...');
    setDrawingImage(imageData);
  };
  
  // تابع جدید برای انتقال اسکرین‌شات
  const handleScreenshot = (imageData: string, fileName?: string) => {
    console.log('Screenshot captured, sending to chat...', fileName || '');
    setScreenshotImage(imageData);
  };

  const handleHighlightsChange = (words: Array<{text: string, type: string}>, page: number | null) => {
    if (page) {
      // به‌روزرسانی هایلایت‌های مربوط به صفحه مشخص شده
      setHighlights(prev => ({
        ...prev,
        [page]: words
      }));
      setHighlightPage(page);
      console.log(`Stored highlights for page ${page}:`, words);
    } else {
      // اگر صفحه مشخص نشده، فقط صفحه فعلی را تنظیم می‌کنیم
      setHighlightPage(page);
    }
  };

  switch (currentView) {
    case 'chat':
      return (
        <div className="h-[calc(100vh-7rem)] flex flex-col">
          <PDFChatHeader />
          <div className="flex-1 overflow-hidden">
            <ResizablePanelGroup 
              direction="horizontal" 
              className="h-full rounded-lg"
            >
              <ResizablePanel 
                defaultSize={50} 
                minSize={30}
                className="h-full"
              >
                <div className="h-full overflow-hidden">
                  <PDFViewer 
                    resourceId={resourceId} 
                    displayName={displayName}
                    onDrawingComplete={handleDrawingComplete}
                    onScreenshot={handleScreenshot}
                  />
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel 
                defaultSize={50} 
                minSize={30}
                className="h-full"
              >
                <div className="h-full overflow-hidden">
                  <PDFChatInterface 
                    resourceId={resourceId}
                    drawingImage={drawingImage}
                    screenshotImage={screenshotImage}
                    onHighlightsChange={handleHighlightsChange}
                  />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </div>
      );
    case 'notes':
      return (
        <div className="h-[calc(100vh-7rem)] flex items-center justify-center text-muted-foreground bg-black">
          Notes view coming soon...
        </div>
      );
    case 'pdf':
      return (
        <div className="h-[calc(100vh-theme(spacing.16))] flex flex-col bg-transparent">
          <PDFViewerNav currentView={currentView} onViewChange={onViewChange} />
          <div className="flex-1 overflow-hidden">
            <ResizablePanelGroup 
              direction="horizontal" 
              className="h-full rounded-lg"
            >
              <ResizablePanel 
                defaultSize={60} 
                minSize={30}
                className="h-full"
              >
                <div className="h-full overflow-hidden">
                  <PDFViewer 
                    resourceId={resourceId} 
                    displayName={displayName}
                    onDrawingComplete={handleDrawingComplete}
                    onScreenshot={handleScreenshot}
                  />
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel 
                defaultSize={40} 
                minSize={30}
                className="h-full"
              >
                <div className="h-full overflow-hidden">
                  <PDFChatInterface 
                    resourceId={resourceId}
                    drawingImage={drawingImage}
                    screenshotImage={screenshotImage}
                  />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </div>
      );
    case 'transcript':
      return (
        <div className="h-[calc(100vh-theme(spacing.16))] flex flex-col bg-transparent">
          <PDFViewerNav currentView={currentView} onViewChange={onViewChange} />
          <div className="flex-1 overflow-hidden">
            <ResizablePanelGroup 
              direction="horizontal" 
              className="h-full rounded-lg"
            >
              <ResizablePanel 
                defaultSize={60} 
                minSize={30}
                className="h-full"
              >
                <div className="h-full overflow-hidden">
                  <PDFTranscriptView 
                    resourceId={resourceId} 
                    highlightWords={highlights[highlightPage || 0] || []}
                    currentHighlightPage={highlightPage}
                    viewType="transcript"
                  />
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel 
                defaultSize={40} 
                minSize={30}
                className="h-full"
              >
                <div className="h-full overflow-hidden">
                  <PDFChatInterface 
                    resourceId={resourceId}
                    drawingImage={drawingImage}
                    screenshotImage={screenshotImage}
                    onHighlightsChange={handleHighlightsChange}
                  />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </div>
      );
    case 'jozveh':
      return (
        <div className="h-[calc(100vh-theme(spacing.16))] flex flex-col bg-transparent">
          <PDFViewerNav currentView={currentView} onViewChange={onViewChange} />
          <div className="flex-1 overflow-hidden">
            <ResizablePanelGroup 
              direction="horizontal" 
              className="h-full rounded-lg"
            >
              <ResizablePanel 
                defaultSize={60} 
                minSize={30}
                className="h-full"
              >
                <div className="h-full overflow-hidden">
                  <PDFTranscriptView 
                    resourceId={resourceId} 
                    highlightWords={highlights[highlightPage || 0] || []}
                    currentHighlightPage={highlightPage}
                    viewType="jozveh"
                  />
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel 
                defaultSize={40} 
                minSize={30}
                className="h-full"
              >
                <div className="h-full overflow-hidden">
                  <PDFChatInterface 
                    resourceId={resourceId}
                    drawingImage={drawingImage}
                    screenshotImage={screenshotImage}
                    onHighlightsChange={handleHighlightsChange}
                  />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </div>
      );
    case 'dual':
      return (
        <div className="h-[calc(100vh-7rem)] flex items-center justify-center text-muted-foreground bg-black">
          Dual view coming soon...
        </div>
      );
    default:
      return <PDFViewer resourceId={resourceId} displayName={displayName} />;
  }
};