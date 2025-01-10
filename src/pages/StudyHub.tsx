interface Resource {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
}

interface StudyHubProps {
  resources: Resource[];
  onResourceAdd: (newResource: Resource) => void;
  onResourceDelete: (resourceId: string) => void;
}

const StudyHub = ({ resources, onResourceAdd, onResourceDelete }: StudyHubProps) => {
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'chat' | 'notes' | 'pdf' | 'transcript' | 'dual' | 'quiz' | 'flashcards' | 'mindmap' | 'matchgame'>('home');

  const handleResourceSelect = (resource: Resource) => {
    setSelectedResource(resource);
  };

  return (
    <div className="flex h-screen">
      <header className="fixed top-0 left-0 right-0 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container flex h-full items-center">
          <StudyHubSidebar
            resources={resources}
            onResourceAdd={onResourceAdd}
            onResourceSelect={handleResourceSelect}
            onViewChange={setCurrentView}
          />
          <div className="flex-1" />
        </div>
      </header>

      <main className="flex-1 pt-16">
        {currentView === 'home' && (
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-8">Study Hub</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Add your study hub content here */}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudyHub;