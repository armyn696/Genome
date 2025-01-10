import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { PDFChatInterface } from "@/components/PDFChatInterface";
import { PDFViewerNav } from "@/components/PDFViewerNav";
import { PDFContent } from "@/components/PDFContent";
import { StudyHubSidebar } from "@/components/studyhub/StudyHubSidebar";

type ViewType = 'notes' | 'pdf' | 'transcript' | 'dual';

const ResourcesPage = () => {
  const [currentView, setCurrentView] = useState<ViewType>('pdf');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get resourceId from state
  const resourceId = location.state?.resourceId || "dummyId";

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border h-16">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <StudyHubSidebar
            resources={[]}
            onResourceAdd={() => {}}
            onResourceSelect={() => {}}
            onViewChange={() => {}}
          />
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/91f667b0-83b5-4bfe-9318-d58898e35220.png" 
              alt="Logo" 
              className="h-12 w-auto cursor-pointer hover:opacity-80"
              onClick={() => navigate('/studyhub')}
            />
          </div>
        </div>
      </header>
      <main className="h-screen pt-16">
        <div className="h-full bg-black">
          <div className="h-full">
            <PDFViewerNav currentView={currentView} onViewChange={handleViewChange} />
            <div className="h-[calc(100vh-7rem)]">
              <ResizablePanelGroup direction="horizontal" className="h-full">
                <ResizablePanel defaultSize={60} minSize={30}>
                  <PDFContent currentView={currentView} resourceId={resourceId} />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={40} minSize={30}>
                  <PDFChatInterface resourceId={resourceId} />
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