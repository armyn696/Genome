import Background from "@/components/Background";
import { StudyHubSidebar } from "@/components/studyhub/StudyHubSidebar";
import ResourceProgress from "@/components/studyhub/ResourceProgress";
import FeaturesSection from "@/components/studyhub/FeaturesSection";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Resource {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
}

const StudyHub = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const navigate = useNavigate();

  const handleResourceAdd = (newResource: Resource) => {
    setResources(prev => [...prev, newResource]);
  };

  const handleResourceDelete = (resourceId: string) => {
    setResources(prev => prev.filter(resource => resource.id !== resourceId));
  };

  const handleResourceSelect = (resource: Resource) => {
    navigate('/studyhub/resources');
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
            onViewChange={(view) => {
              switch (view) {
                case 'chat':
                  navigate('/studyhub/chat');
                  break;
                case 'quiz':
                  navigate('/studyhub/quiz');
                  break;
                case 'flashcards':
                  navigate('/studyhub/flashcards');
                  break;
                case 'mindmap':
                  navigate('/studyhub/mindmap');
                  break;
                case 'matchgame':
                  navigate('/studyhub/matchgame');
                  break;
                default:
                  break;
              }
            }}
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
        <div className="container mx-auto px-4 py-8">
          <FeaturesSection />
          <ResourceProgress 
            resources={resources} 
            onResourceAdd={handleResourceAdd} 
            onResourceDelete={handleResourceDelete}
            onResourceSelect={handleResourceSelect}
          />
        </div>
      </main>
    </div>
  );
};

export default StudyHub;