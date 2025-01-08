import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onSendImage?: (file: File) => void;
  onSendVoice?: (blob: Blob) => void;
  isLoading?: boolean;
  resources?: any[];
  onResourceSelect?: (resource: any) => void;
  selectedResources?: any[];
  showResourceSelect?: boolean;
}

export const ChatInput = ({ 
  onSendMessage, 
  onSendImage, 
  onSendVoice, 
  isLoading,
  resources,
  onResourceSelect,
  selectedResources,
  showResourceSelect = true
}: ChatInputProps) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex gap-2">
        {showResourceSelect && resources && onResourceSelect && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {/* Resource selection logic */}}
            className="shrink-0"
          >
            Materials
          </Button>
        )}
        <div className="flex-1 flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[44px] max-h-32"
          />
          <Button type="submit" disabled={isLoading} className="shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
};
