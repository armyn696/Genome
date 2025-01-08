import { Mic, BookOpen, Brain, Video, MessageSquare, GraduationCap, PuzzlePiece, Headphones } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    title: "Record Live Lecture",
    description: "Take notes and ask questions in real-time, without touching your computer.",
    icon: Mic,
  },
  {
    title: "Flashcards",
    description: "Generate flashcards from your materials to practice memorizing concepts.",
    icon: BookOpen,
  },
  {
    title: "QuizFetch",
    description: "Generate quizzes from your materials learn as you answer questions.",
    icon: Brain,
  },
  {
    title: "Explainers",
    description: "Generate an educational video from your materials.",
    icon: Video,
  },
  {
    title: "Chat with Spark.E",
    description: "Chat with Spark.E and learn about your documents in real time!",
    icon: MessageSquare,
  },
  {
    title: "Practice Tests",
    description: "Get ready for your test, it's time to practice!",
    icon: GraduationCap,
  },
  {
    title: "Match Game",
    description: "Practice learning terms by matching them with their definitions.",
    icon: PuzzlePiece,
  },
  {
    title: "Audio Recap",
    description: "Generate a 6-45 minute podcast, lecture, or summary from your study materials.",
    icon: Headphones,
  },
];

const FeaturesSection = () => {
  return (
    <Card className="bg-sidebar p-6 rounded-lg border-sidebar-border">
      <h2 className="text-2xl font-bold mb-6 text-white">Our Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex items-start gap-4 hover:bg-sidebar-accent/10 p-4 rounded-lg transition-colors"
          >
            <div className="p-2 rounded-lg bg-sidebar-accent/20">
              <feature.icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default FeaturesSection;