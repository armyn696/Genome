import { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';
import { ChatWelcome } from './ChatWelcome';

interface Message {
  text: string;
  sender: 'user' | 'ai';
  image?: string;
  audio?: string;
}

interface PDFChatInterfaceProps {
  resourceId: string;
}

export const PDFChatInterface = ({ resourceId }: PDFChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      text,
      sender: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        text: "I'm here to help you understand this PDF. What would you like to know about it?",
        sender: 'ai'
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4 space-y-4">
        {messages.length === 0 ? (
          <ChatWelcome onSuggestionClick={handleSendMessage} />
        ) : (
          <div className="space-y-6">
            {messages.map((msg, index) => (
              <ChatMessage key={index} {...msg} />
            ))}
            {isLoading && (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <div className="animate-bounce">●</div>
                <div className="animate-bounce delay-100">●</div>
                <div className="animate-bounce delay-200">●</div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        showResourceSelect={false}
      />
    </div>
  );
};