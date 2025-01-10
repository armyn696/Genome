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
    <div className="flex flex-col items-center justify-center h-full space-y-4 text-center px-4">
      <h1 className="text-2xl md:text-3xl font-bold">AI Study Assistant</h1>
      <p className="text-sm md:text-base text-muted-foreground max-w-lg">
        I'm your personal study assistant. Ask me anything about your study materials!
      </p>
      <div className="grid grid-cols-1 gap-2 mt-2 w-full max-w-xl">
        {suggestions.map((suggestion) => (
          <Button
            key={suggestion}
            variant="outline"
            className="w-full px-3 py-2 h-auto text-left flex items-center gap-2 bg-sidebar-accent hover:bg-sidebar-accent/80 text-xs md:text-sm"
            onClick={() => onSuggestionClick(suggestion)}
          >
            <Lightbulb className="w-4 h-4 text-primary flex-shrink-0" />
            <span>{suggestion}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};