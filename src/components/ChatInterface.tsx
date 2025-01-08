import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  text: string;
  sender: 'user' | 'ai';
}

interface ChatInterfaceProps {
  resourceId: string;
}

export const ChatInterface = ({ resourceId }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: Message = {
      text: message,
      sender: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage('');

    // TODO: Implement AI response logic here
    // For now, we'll just echo back
    const aiMessage: Message = {
      text: `You said: ${message}`,
      sender: 'ai'
    };
    
    setMessages(prev => [...prev, aiMessage]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="sticky bottom-0 px-4">
        <div className="flex items-center gap-2 w-full backdrop-blur-sm p-4 rounded-t-xl border-t">
          <Textarea
            placeholder="Ask a question about the PDF..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="resize-none"
            rows={1}
          />
          <Button
            onClick={handleSendMessage}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};