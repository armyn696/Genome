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
    <div className="flex flex-col items-center justify-center h-full space-y-3 text-center px-3">
      <h1 className="text-xl md:text-2xl font-bold">AI Study Assistant</h1>
      <p className="text-xs md:text-sm text-muted-foreground max-w-md">
        I'm your personal study assistant. Ask me anything about your study materials!
      </p>
      <div className="grid grid-cols-1 gap-2 mt-1 w-full max-w-lg">
        {suggestions.map((suggestion) => (
          <Button
            key={suggestion}
            variant="outline"
            className="w-full px-2 py-1.5 h-auto text-left flex items-center gap-1.5 bg-sidebar-accent hover:bg-sidebar-accent/80 text-xs"
            onClick={() => onSuggestionClick(suggestion)}
          >
            <Lightbulb className="w-3 h-3 text-primary flex-shrink-0" />
            <span>{suggestion}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};