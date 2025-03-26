import { useParams, useNavigate } from 'react-router-dom';
import { PDFContent } from '@/components/PDFContent';
import Background from '@/components/Background';
import { StudyHubSidebar } from '@/components/studyhub/StudyHubSidebar';
import { useResources } from '@/hooks/useResources';
import { Link } from 'react-router-dom';
import { Resource } from '@/types';

export const PDFPage = () => {
  const { resourceId } = useParams();
  const navigate = useNavigate();
  const { resources, addResource, deleteResource } = useResources();

  const resource = resources.find(r => r.id === resourceId);
  const displayName = resource?.name || '';

  const handleViewChange = (view: 'home' | 'chat' | 'notes' | 'pdf' | 'transcript' | 'dual' | 'quiz' | 'flashcards' | 'mindmap' | 'matchgame') => {
    switch (view) {
      case 'home':
        navigate('/studyhub');
        break;
      case 'chat':
        navigate('/studyhub/resources/chat');
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
  };

  return (
    <div className="min-h-screen bg-background">
      <Background />
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border h-16">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <StudyHubSidebar
            resources={resources}
            onResourceAdd={(resource: Resource) => addResource(resource as any)}
            onResourceSelect={(resource) => navigate(`/studyhub/resources/${resource.id}`)}
            onViewChange={handleViewChange}
          />
          <div className="flex items-center gap-4">
            <Link to="/studyhub">
              <img 
                src="/lovable-uploads/91f667b0-83b5-4bfe-9318-d58898e35220.png" 
                alt="Logo" 
                className="h-12 w-auto"
              />
            </Link>
          </div>
        </div>
      </header>
      <main className="pt-16">
        <PDFContent currentView="pdf" resourceId={resourceId || ''} displayName={displayName} />
      </main>
    </div>
  );
};

export default PDFPage;
