import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Send, Image as ImageIcon } from "lucide-react";
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
  const [isWebSearchEnabled] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      text: message,
      sender: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage('');

    // TODO: Implement AI response logic here
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
    <div className="flex flex-col h-full border rounded-lg bg-background/95 backdrop-blur-sm">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground border'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t bg-background/95 backdrop-blur-sm p-4">
        <div className="flex items-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Textarea
            placeholder="Message Spark.E..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="resize-none bg-muted/50 border-muted-foreground/20 min-h-[2.5rem] max-h-[10rem]"
            rows={1}
          />
          <Button
            onClick={handleSendMessage}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};