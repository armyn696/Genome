import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";

interface ChatWelcomeProps {
  onSuggestionClick: (suggestion: string) => void;
}

export const ChatWelcome = ({ onSuggestionClick }: ChatWelcomeProps) => {
  return (
    <div className="flex flex-col items-center h-full pt-4 space-y-2 text-center px-3">
      <h1 className="text-xl md:text-2xl font-bold">AI Study Assistant</h1>
      <p className="text-xs md:text-sm text-muted-foreground max-w-md">
        I'm your personal study assistant. Ask me anything about your study materials!
      </p>
    </div>
  );
};