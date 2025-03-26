import Background from "@/components/Background";
import QuizHub from "@/components/quiz/QuizHub";
import { StudyHubHeader } from "@/components/studyhub/StudyHubHeader";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useResources } from "@/hooks/useResources";
import { Resource } from "@/types";

const QuizPage = () => {
  const navigate = useNavigate();
  const { resources, addResource } = useResources();
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

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
      case 'mindmap':
        navigate('/studyhub/mindmap');
        break;
      case 'matchgame':
        navigate('/studyhub/matchgame');
        break;
      case 'flashcards':
        navigate('/studyhub/flashcards');
        break;
      case 'teach':
        navigate('/studyhub/teach');
        break;
      default:
        // For other views, stay on the current page
        break;
    }
  };

  return (
    <div className="relative min-h-screen">
      <Background />
      <StudyHubHeader
        resources={resources}
        onResourceAdd={addResource}
        onResourceSelect={handleResourceSelect}
        onViewChange={handleViewChange}
      />
      <main className="h-screen pt-16">
        <QuizHub />
      </main>
    </div>
  );
};

export default QuizPage;