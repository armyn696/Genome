import { PDFViewer } from "@/components/PDFViewer";
import { PDFChatInterface } from "@/components/PDFChatInterface";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { PDFChatHeader } from "@/components/pdf/PDFChatHeader";
import { PDFChatPanel } from "@/components/pdf/PDFChatPanel";
import { PDFDrawingCanvas } from "@/components/pdf/PDFDrawingCanvas";
import { useState } from "react";

interface PDFContentProps {
  currentView: 'chat' | 'notes' | 'pdf' | 'transcript' | 'dual' | 'quiz' | 'flashcards' | 'mindmap' | 'matchgame';
  resourceId: string;
}

export const PDFContent = ({ currentView, resourceId }: PDFContentProps) => {
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'ai' }[]>([]);
  const [message, setMessage] = useState('');
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const userMessage = {
      text: message,
      sender: 'user' as const
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        text: "I'm here to help you understand the PDF content. What would you like to know?",
        sender: 'ai' as const
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const toggleDrawingMode = () => {
    setIsDrawingMode(prev => !prev);
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
                    isDrawingMode={isDrawingMode}
                    onToggleDrawing={toggleDrawingMode}
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
                  <PDFChatPanel
                    messages={messages}
                    message={message}
                    setMessage={setMessage}
                    handleSendMessage={handleSendMessage}
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
      return <PDFViewer resourceId={resourceId} />;
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
    case 'quiz':
      return (
        <div className="h-[calc(100vh-7rem)] flex items-center justify-center text-muted-foreground bg-black">
          Quiz view coming soon...
        </div>
      );
    case 'flashcards':
      return (
        <div className="h-[calc(100vh-7rem)] flex items-center justify-center text-muted-foreground bg-black">
          Flashcards view coming soon...
        </div>
      );
    case 'mindmap':
      return (
        <div className="h-[calc(100vh-7rem)] flex items-center justify-center text-muted-foreground bg-black">
          Mindmap view coming soon...
        </div>
      );
    case 'matchgame':
      return (
        <div className="h-[calc(100vh-7rem)] flex items-center justify-center text-muted-foreground bg-black">
          Match Game view coming soon...
        </div>
      );
    default:
      return <PDFViewer resourceId={resourceId} />;
  }
};