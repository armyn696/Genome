import { MessageSquare, Cards, TestTube, Network, Gamepad } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: <MessageSquare className="w-12 h-12 text-primary" />,
      title: "Chat with Spark.E",
      description: "Chat with Spark.E and learn about your documents in real time!"
    },
    {
      icon: <Cards className="w-12 h-12 text-primary" />,
      title: "Flashcards",
      description: "Generate flashcards from your materials to practice memorizing concepts."
    },
    {
      icon: <TestTube className="w-12 h-12 text-primary" />,
      title: "Quiz",
      description: "Generate quizzes from your materials learn as you answer questions."
    },
    {
      icon: <Network className="w-12 h-12 text-primary" />,
      title: "Mind Maps",
      description: "Create visual mind maps to better understand and connect concepts."
    },
    {
      icon: <Gamepad className="w-12 h-12 text-primary" />,
      title: "Match Game",
      description: "Practice learning terms by matching them with their definitions."
    }
  ];

  return (
    <div className="space-y-6 mb-8">
      <h2 className="text-2xl font-bold">Our Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-6 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="shrink-0">{feature.icon}</div>
            <div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturesSection;