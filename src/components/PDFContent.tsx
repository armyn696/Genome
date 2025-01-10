import { PDFViewer } from "@/components/PDFViewer";
import { PDFChatInterface } from "@/components/PDFChatInterface";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { PDFChatHeader } from "@/components/pdf/PDFChatHeader";
import { PDFChatPanel } from "@/components/pdf/PDFChatPanel";
import { useState } from "react";

interface PDFContentProps {
  currentView: 'chat' | 'notes' | 'pdf' | 'transcript' | 'dual' | 'quiz' | 'flashcards' | 'mindmap' | 'matchgame';
  resourceId: string;
}

export const PDFContent = ({ currentView, resourceId }: PDFContentProps) => {
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'ai' }[]>([]);
  const [message, setMessage] = useState('');

  const handleSendMessage = (text?: string) => {
    if (!text?.trim() && !message.trim()) return;

    const messageText = text || message;

    const userMessage = {
      text: messageText,
      sender: 'user' as const
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        text: "I've received your selection. How can I help you understand this part better?",
        sender: 'ai' as const
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const handleSelectionComplete = (selection: string) => {
    handleSendMessage(`Selected text from PDF: ${selection}`);
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
                <div className="h-full w-full relative">
                  <PDFViewer 
                    resourceId={resourceId} 
                    onSelectionComplete={handleSelectionComplete}
                  />
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel 
                defaultSize={50} 
                minSize={30}
                className="h-full"
              >
                <div className="h-full w-full">
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