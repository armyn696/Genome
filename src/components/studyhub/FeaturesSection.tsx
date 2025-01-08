import { Mic, BookOpen, Brain, Video, MessageSquare, GraduationCap, Gamepad2, Headphones } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: BookOpen,
    title: "Study Resources",
    description: "Upload and manage your study materials"
  },
  {
    icon: Brain,
    title: "Mind Maps",
    description: "Visualize concepts and connections"
  },
  {
    icon: GraduationCap,
    title: "Quiz",
    description: "Test your knowledge with interactive quizzes"
  },
  {
    icon: MessageSquare,
    title: "Flashcards",
    description: "Practice with digital flashcards"
  },
  {
    icon: Gamepad2,
    title: "Match Game",
    description: "Learn through interactive matching games"
  },
  {
    icon: Mic,
    title: "Record Live Lecture",
    description: "Record and save your lectures"
  }
];

export const FeaturesSection = () => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {features.map((feature, index) => (
        <Card key={index} className="bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};