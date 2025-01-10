interface Resource {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
}

interface FlashcardsPageProps {
  resources: Resource[];
  onResourceAdd: (newResource: Resource) => void;
  onResourceDelete: (resourceId: string) => void;
}

const FlashcardsPage = ({ resources, onResourceAdd, onResourceDelete }: FlashcardsPageProps) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <FlashcardsHub />
      </div>
    </div>
  );
};

export default FlashcardsPage;