import { StudyHubSidebar } from "@/components/studyhub/StudyHubSidebar";
import Background from "@/components/Background";
import { EnhancedChatInterface } from "@/components/EnhancedChatInterface";
import { useState } from "react";

interface Resource {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
}

const ChatPage = () => {
  const [resources, setResources] = useState<Resource[]>([]);

  const handleResourceAdd = (newResource: Resource) => {
    setResources(prev => [...prev, newResource]);
  };

  const handleResourceSelect = (resource: Resource) => {
    // Handle resource selection
  };

  const handleViewChange = (view: 'home' | 'chat' | 'notes' | 'pdf' | 'transcript' | 'dual' | 'quiz' | 'flashcards' | 'mindmap' | 'matchgame') => {
    if (view === 'home') {
      window.location.href = '/studyhub';
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
        <div className="container mx-auto h-full">
          <EnhancedChatInterface resources={resources} />
        </div>
      </main>
    </div>
  );
};

export default ChatPage;