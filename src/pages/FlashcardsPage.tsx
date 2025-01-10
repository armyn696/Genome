import Background from "@/components/Background";
import FlashcardsHub from "@/components/flashcards/FlashcardsHub";
import { StudyHubSidebar } from "@/components/studyhub/StudyHubSidebar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useResources } from "@/hooks/useResources";
import { Resource } from "@/types";

const FlashcardsPage = () => {
  const navigate = useNavigate();
  const { resources, addResource } = useResources();
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const handleResourceSelect = (resource: Resource) => {
    setSelectedResource(resource);
    // You can add additional handling here if needed
  };

  const handleViewChange = (view: 'home' | 'chat' | 'notes' | 'pdf' | 'transcript' | 'dual' | 'quiz' | 'flashcards' | 'mindmap' | 'matchgame') => {
    switch (view) {
      case 'home':
        navigate('/studyhub');
        break;
      case 'chat':
        navigate('/studyhub/chat');
        break;
      case 'quiz':
        navigate('/studyhub/quiz');
        break;
      case 'mindmap':
        navigate('/studyhub/mindmap');
        break;
      case 'matchgame':
        navigate('/studyhub/matchgame');
        break;
      default:
        // For other views, stay on the current page
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Background />
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border h-16">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <StudyHubSidebar
            resources={resources}
            onResourceAdd={addResource}
            onResourceSelect={handleResourceSelect}
            onViewChange={handleViewChange}
          />
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
        <FlashcardsHub />
      </main>
    </div>
  );
};

export default FlashcardsPage;