import { Button } from "@/components/ui/button";

interface ChatWelcomeProps {
  onSuggestionClick: (suggestion: string) => void;
}

export const ChatWelcome = ({ onSuggestionClick }: ChatWelcomeProps) => {
  const suggestions = [
    "Explain this concept in simple terms",
    "Create a study plan for me",
    "Help me understand this topic",
    "Quiz me on this material"
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
      <h1 className="text-4xl font-bold">AI Study Assistant</h1>
      <p className="text-lg text-muted-foreground max-w-xl">
        I'm your personal study assistant. Ask me anything about your study materials!
      </p>
      <div className="grid grid-cols-2 gap-4 mt-8 max-w-2xl w-full">
        {suggestions.map((suggestion) => (
          <Button
            key={suggestion}
            variant="outline"
            className="h-24 p-4 text-left flex items-start"
            onClick={() => onSuggestionClick(suggestion)}
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
};