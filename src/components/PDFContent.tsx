import { PDFViewer } from "./PDFViewer";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { PDFChatHeader } from "@/components/pdf/PDFChatHeader";
import { PDFViewerNav } from "./PDFViewerNav";
import { useState } from "react";
import { PDFChatInterface } from "./PDFChatInterface";

interface PDFContentProps {
  currentView: 'chat' | 'notes' | 'pdf' | 'transcript' | 'dual';
  resourceId: string;
  displayName: string;
}

export const PDFContent: React.FC<PDFContentProps> = ({ currentView, resourceId, displayName }) => {
  // این state برای ذخیره آخرین تصویر نقاشی استفاده می‌شود
  const [drawingImage, setDrawingImage] = useState<string | undefined>(undefined);
  // اضافه کردن state برای ذخیره تصویر اسکرین‌شات
  const [screenshotImage, setScreenshotImage] = useState<string | undefined>(undefined);

  const handleDrawingComplete = (imageData: string) => {
    console.log('Drawing completed, sending to chat...');
    setDrawingImage(imageData);
  };
  
  // تابع جدید برای انتقال اسکرین‌شات
  const handleScreenshot = (imageData: string, fileName: string) => {
    console.log('Screenshot captured, sending to chat...', fileName);
    setScreenshotImage(imageData);
  };

  const onViewChange = (newView: 'chat' | 'notes' | 'pdf' | 'transcript' | 'dual') => {
    // Add your view change logic here if needed
    console.log('View changed to:', newView);
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
        <div className="h-[calc(100vh-7rem)] flex items-center justify-center text-muted-foreground bg-black">
          Transcript view coming soon...
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