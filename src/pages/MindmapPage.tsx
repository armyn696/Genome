import Background from "@/components/Background";
import MindmapHub from "@/components/mindmap/MindmapHub";
import { StudyHubSidebar } from "@/components/studyhub/StudyHubSidebar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Resource {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
}

const MindmapPage = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const navigate = useNavigate();

  const handleResourceAdd = (newResource: Resource) => {
    setResources(prev => [...prev, newResource]);
  };

  const handleResourceSelect = (resource: Resource) => {
    // Handle resource selection if needed
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
      case 'flashcards':
        navigate('/studyhub/flashcards');
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
            onResourceAdd={handleResourceAdd}
            onResourceSelect={handleResourceSelect}
            onViewChange={handleViewChange}
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
        <MindmapHub />
      </main>
    </div>
  );
};

export default MindmapPage;