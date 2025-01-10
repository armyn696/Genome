import { useState } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { PDFChatInterface } from "@/components/PDFChatInterface";
import { PDFViewerNav } from "@/components/PDFViewerNav";
import { PDFContent } from "@/components/PDFContent";
import { useNavigate } from "react-router-dom";

const ResourcesPage = () => {
  const [currentView, setCurrentView] = useState<'chat' | 'notes' | 'pdf' | 'transcript' | 'dual' | 'quiz' | 'flashcards' | 'mindmap' | 'matchgame'>('pdf');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border h-16">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <button
            onClick={() => navigate('/studyhub')}
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md"
          >
            Dashboard
          </button>
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/91f667b0-83b5-4bfe-9318-d58898e35220.png" 
              alt="Logo" 
              className="h-12 w-auto cursor-pointer"
              onClick={() => navigate('/studyhub')}
            />
          </div>
        </div>
      </header>
      <main className="h-screen pt-16">
        <div className="h-full bg-black">
          <div className="h-full">
            <PDFViewerNav currentView={currentView} onViewChange={setCurrentView} />
            <div className="h-[calc(100vh-7rem)]">
              <ResizablePanelGroup direction="horizontal" className="h-full">
                <ResizablePanel defaultSize={60} minSize={30}>
                  <PDFContent currentView={currentView} resourceId="default" />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={40} minSize={30} className="bg-background">
                  <PDFChatInterface resourceId="default" />
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResourcesPage;