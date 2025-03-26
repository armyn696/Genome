import { StudyHubHeader } from "@/components/studyhub/StudyHubHeader";
import TeachHub from "@/components/teach/TeachHub";
import Background from "@/components/Background";
import { useNavigate } from "react-router-dom";
import { useResources } from "@/hooks/useResources";
import { Resource } from "@/types";

const TeachPage = () => {
  const navigate = useNavigate();
  const { resources, addResource, renameResource } = useResources();

  const handleAddResource = (resource: Resource) => {
    if (resource instanceof File) {
      addResource(resource);
    }
  };

  const handleRenameResource = (resourceId: string, newName: string) => {
    renameResource({ resourceId, newName });
  };

  const handleResourceSelect = (resource: Resource) => {
    navigate(`/studyhub/resources/pdf/${resource.id}`);
  };

  const handleViewChange = (view: 'home' | 'chat' | 'notes' | 'pdf' | 'transcript' | 'dual' | 'quiz' | 'flashcards' | 'mindmap' | 'matchgame' | 'teach') => {
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
      case 'mindmap':
        navigate('/studyhub/mindmap');
        break;
      case 'matchgame':
        navigate('/studyhub/matchgame');
        break;
      case 'teach':
        navigate('/studyhub/teach');
        break;
      default:
        break;
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
        <TeachHub />
      </main>
    </div>
  );
};

export default TeachPage;
