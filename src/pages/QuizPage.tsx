interface Resource {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
}

interface QuizPageProps {
  resources: Resource[];
  onResourceAdd: (newResource: Resource) => void;
  onResourceDelete: (resourceId: string) => void;
}

const QuizPage = ({ resources, onResourceAdd, onResourceDelete }: QuizPageProps) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quiz</h1>
          <p className="text-muted-foreground">
            Test your knowledge with interactive quizzes
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="rounded-lg border bg-card p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
          <p className="text-muted-foreground mb-4">
            Quiz feature is under development
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;