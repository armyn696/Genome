import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";

interface ChatWelcomeProps {
  onSuggestionClick: (suggestion: string) => void;
}

export const ChatWelcome = ({ onSuggestionClick }: ChatWelcomeProps) => {
  const suggestions = [
    "Find me 3 insightful quotes from the materials I selected",
    "What is the main idea of the materials I selected?",
    "Summarize my course materials for me like im 5 years old",
    "Help me understand this topic"
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6 text-center">
      <h1 className="text-4xl font-bold">AI Study Assistant</h1>
      <p className="text-lg text-muted-foreground max-w-xl">
        I'm your personal study assistant. Ask me anything about your study materials!
      </p>
      <div className="grid grid-cols-1 gap-3 mt-4 max-w-2xl w-full px-4">
        {suggestions.map((suggestion) => (
          <Button
            key={suggestion}
            variant="outline"
            className="w-full px-4 py-3 h-auto text-left flex items-center gap-3 bg-sidebar-accent hover:bg-sidebar-accent/80"
            onClick={() => onSuggestionClick(suggestion)}
          >
            <Lightbulb className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="text-sm">{suggestion}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};