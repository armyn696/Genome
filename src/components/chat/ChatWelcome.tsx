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
    <div className="flex flex-col items-center justify-center h-full w-full p-2 space-y-2 text-center">
      <h1 className="text-xl font-bold">AI Study Assistant</h1>
      <p className="text-xs text-muted-foreground max-w-full mb-1">
        I'm your personal study assistant. Ask me anything about your study materials!
      </p>
      <div className="grid grid-cols-1 gap-2 w-full max-w-md mt-2">
        {suggestions.map((suggestion) => (
          <Button
            key={suggestion}
            variant="outline"
            className="w-full px-2 py-1.5 h-auto text-left flex items-center gap-2 bg-sidebar-accent hover:bg-sidebar-accent/80 text-xs"
            onClick={() => onSuggestionClick(suggestion)}
          >
            <Lightbulb className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="line-clamp-1">{suggestion}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};