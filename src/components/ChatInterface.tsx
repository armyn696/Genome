import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

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
    <div className="flex flex-col h-screen bg-background">
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <img
              src="/lovable-uploads/ea974bf0-54b5-4e40-9981-0d849bfccbf7.png"
              alt="AI Assistant"
              className="w-16 h-16 rounded-full mb-4"
            />
            <h1 className="text-2xl font-bold mb-2">Hi, I'm Spark.E</h1>
            <p className="text-muted-foreground text-center mb-8">
              Ask me anything about learning, or try one of these examples:
            </p>
            <div className="grid gap-4 w-full max-w-2xl">
              <Button
                variant="outline"
                className="h-auto py-4 px-6 text-left flex items-start gap-4"
              >
                <span className="text-primary text-lg">💡</span>
                <span>Find me 3 insightful quotes from the materials I selected</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 px-6 text-left flex items-start gap-4"
              >
                <span className="text-primary text-lg">💡</span>
                <span>What is the main idea of the materials I selected?</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 px-6 text-left flex items-start gap-4"
              >
                <span className="text-primary text-lg">💡</span>
                <span>Summarize my course materials for me like I'm 5 years old</span>
              </Button>
            </div>
          </div>
        ) : (
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
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t bg-background p-4">
        <div className="flex items-end gap-2 max-w-4xl mx-auto">
          <Textarea
            placeholder="Message Spark.E..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="resize-none bg-muted/50 border-muted-foreground/20"
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