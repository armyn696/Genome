import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import Background from "@/components/Background";
import { ChatInterface } from "@/components/ChatInterface";
import { EnhancedChatInterface } from "@/components/EnhancedChatInterface";
import { PDFViewerNav } from "@/components/PDFViewerNav";
import { PDFContent } from "@/components/PDFContent";
import QuizHub from "@/components/quiz/QuizHub";
import FlashcardsHub from "@/components/flashcards/FlashcardsHub";
import MindmapHub from "@/components/mindmap/MindmapHub";
import MatchGameHub from "@/components/matchgame/MatchGameHub";
import { StudyHubSidebar } from "@/components/studyhub/StudyHubSidebar";
import { HomePage } from "@/components/studyhub/HomePage";
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";

interface Resource {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
}

const StudyHub = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'chat' | 'notes' | 'pdf' | 'transcript' | 'dual' | 'quiz' | 'flashcards' | 'mindmap' | 'matchgame'>('home');

  const handleResourceAdd = (newResource: Resource) => {
    setResources(prev => [...prev, newResource]);
  };

  const handleResourceSelect = (resource: Resource) => {
    setSelectedResource(resource);
    setCurrentView('pdf');
  };

  const renderContent = () => {
    if (currentView === 'home') {
      return <HomePage resources={resources} onResourceSelect={handleResourceSelect} />;
    }

    if (selectedResource && currentView === 'pdf') {
      return (
        <div className="h-full bg-black">
          <div className="h-full">
            <PDFViewerNav currentView={currentView} onViewChange={setCurrentView} />
            <div className="h-[calc(100vh-7rem)]">
              <ResizablePanelGroup direction="horizontal" className="h-full">
                <ResizablePanel defaultSize={60} minSize={30}>
                  <PDFContent currentView={currentView} resourceId={selectedResource.id} />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={40} minSize={30}>
                  <ChatInterface resourceId={selectedResource.id} />
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'chat':
        return (
          <div className="h-[calc(100vh-4rem)]">
            <EnhancedChatInterface resources={resources} />
          </div>
        );
      case 'quiz':
        return <QuizHub />;
      case 'flashcards':
        return <FlashcardsHub />;
      case 'mindmap':
        return <MindmapHub />;
      case 'matchgame':
        return <MatchGameHub />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Background />
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border h-16">
            <div className="container mx-auto px-4 h-full flex items-center justify-between">
              <StudyHubSidebar
                resources={resources}
                onResourceAdd={handleResourceAdd}
                onResourceSelect={handleResourceSelect}
                onViewChange={setCurrentView}
              />
              <div className="flex items-center gap-2">
                <img 
                  src="/lovable-uploads/91f667b0-83b5-4bfe-9318-d58898e35220.png" 
                  alt="Logo" 
                  className="h-12 w-auto"
                />
              </div>
            </div>
          </header>
          <main className="h-screen pt-16">
            {renderContent()}
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default StudyHub;