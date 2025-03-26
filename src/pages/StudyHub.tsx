import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import Background from "@/components/Background";
import { PDFChatInterface } from "@/components/PDFChatInterface";
import { PDFViewerNav } from "@/components/PDFViewerNav";
import { PDFContent } from "@/components/PDFContent";
import QuizHub from "@/components/quiz/QuizHub";
import FlashcardsHub from "@/components/flashcards/FlashcardsHub";
import MindmapHub from "@/components/mindmap/MindmapHub";
import MatchGameHub from "@/components/matchgame/MatchGameHub";
import { StudyHubHeader } from "@/components/studyhub/StudyHubHeader";
import { StudyHubSidebar } from "@/components/studyhub/StudyHubSidebar";
import ResourceProgress from "@/components/studyhub/ResourceProgress";
import FeaturesSection from "@/components/studyhub/FeaturesSection";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useResources } from "@/hooks/useResources";
import { Resource } from "@/types";

type ViewType = 'home' | 'chat' | 'notes' | 'pdf' | 'transcript' | 'dual' | 'quiz' | 'flashcards' | 'mindmap' | 'matchgame' | 'teach';

const StudyHub = () => {
  const { resources, addResource, deleteResource, renameResource } = useResources();
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const navigate = useNavigate();
  const location = useLocation();

  // Handle initial view from location state
  useEffect(() => {
    if (location.state?.view) {
      setCurrentView(location.state.view);
      // Clear the state after using it
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleResourceSelect = (resource: Resource) => {
    setSelectedResource(resource);
    navigate(`/studyhub/resources/pdf/${resource.id}`);
  };

  const handleViewChange = (view: ViewType | 'chat' | 'teach') => {
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
      case 'teach':
        navigate('/studyhub/teach');
        break;
      case 'pdf':
        if (selectedResource) {
          navigate(`/studyhub/resources/pdf/${selectedResource.id}`);
        }
        break;
      default:
        setCurrentView(view as ViewType);
    }
  };

  const handleAddResource = (resource: Resource) => {
    if (resource instanceof File) {
      addResource(resource);
    }
  };

  const handleRenameResource = (resourceId: string, newName: string) => {
    renameResource({ resourceId, newName });
  };

  const renderContent = () => {
    if (currentView === 'home' || !currentView) {
      return (
        <div className="container mx-auto px-4 py-8">
          <FeaturesSection />
          <ResourceProgress 
            resources={resources} 
            onResourceAdd={handleAddResource} 
            onResourceDelete={deleteResource}
            onResourceSelect={handleResourceSelect}
            onResourceRename={handleRenameResource}
          />
        </div>
      );
    }

    if (selectedResource) {
      switch (currentView) {
        case 'chat':
          navigate('/studyhub/chat');
          return null;
        case 'quiz':
          return <QuizHub />;
        case 'flashcards':
          return <FlashcardsHub />;
        case 'mindmap':
          return <MindmapHub />;
        case 'matchgame':
          return <MatchGameHub />;
        case 'teach':
          navigate('/studyhub/teach');
          return null;
        default:
          navigate(`/studyhub/resources/pdf/${selectedResource.id}`);
          return null;
      }
    } else {
      switch (currentView) {
        case 'chat':
          navigate('/studyhub/chat');
          return null;
        case 'quiz':
          navigate('/studyhub/quiz');
          return null;
        case 'flashcards':
          navigate('/studyhub/flashcards');
          return null;
        case 'mindmap':
          navigate('/studyhub/mindmap');
          return null;
        case 'matchgame':
          navigate('/studyhub/matchgame');
          return null;
        case 'teach':
          navigate('/studyhub/teach');
          return null;
        default:
          return null;
      }
    }
  };

  return (
    <div className="relative min-h-screen">
      <Background />
      <StudyHubHeader
        resources={resources}
        onResourceAdd={handleAddResource}
        onResourceSelect={handleResourceSelect}
        onViewChange={handleViewChange}
        onResourceRename={handleRenameResource}
      />
      <main className="h-screen pt-16">
        {currentView === 'home' || !currentView ? (
          <div className="container mx-auto px-4 py-8">
            <FeaturesSection />
            <ResourceProgress 
              resources={resources} 
              onResourceAdd={handleAddResource} 
              onResourceDelete={deleteResource}
              onResourceSelect={handleResourceSelect}
              onResourceRename={handleRenameResource}
            />
          </div>
        ) : (
          renderContent()
        )}
      </main>
    </div>
  );
};

export default StudyHub;
