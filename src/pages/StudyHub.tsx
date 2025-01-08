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
import ResourceProgress from "@/components/studyhub/ResourceProgress";
import FeaturesSection from "@/components/studyhub/FeaturesSection";
import { useState } from "react";

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

  const handleResourceDelete = (resourceId: string) => {
    setResources(prev => prev.filter(resource => resource.id !== resourceId));
    if (selectedResource?.id === resourceId) {
      setSelectedResource(null);
      setCurrentView('home');
    }
  };

  const handleResourceSelect = (resource: Resource) => {
    setSelectedResource(resource);
    setCurrentView('pdf');
  };

  const renderContent = () => {
    if (currentView === 'home') {
      return (
        <div className="container mx-auto px-4 py-8">
          <FeaturesSection />
          <ResourceProgress 
            resources={resources} 
            onResourceAdd={handleResourceAdd} 
            onResourceDelete={handleResourceDelete}
            onResourceSelect={handleResourceSelect}
          />
        </div>
      );
    }

    // Special views that don't use the split panel layout
    if (['chat', 'quiz', 'flashcards', 'mindmap', 'matchgame'].includes(currentView)) {
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
    }

    // If a resource is selected, show the split panel layout
    if (selectedResource) {
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

    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <Background />
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
  );
};

export default StudyHub;