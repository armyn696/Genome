import { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatInput } from './chat/ChatInput';
import { ChatMessage } from './chat/ChatMessage';
import { ChatWelcome } from './chat/ChatWelcome';

interface Message {
  text: string;
  sender: 'user' | 'ai';
  image?: string;
  audio?: string;
}

interface ChatInterfaceProps {
  resourceId: string;
}

export const ChatInterface = ({ resourceId }: ChatInterfaceProps) => {
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
        text: "I'm an AI assistant. I'm here to help you study and learn. How can I assist you today?",
        sender: 'ai'
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleSendImage = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const userMessage: Message = {
        text: "Sent an image",
        sender: 'user',
        image: e.target?.result as string
      };
      setMessages(prev => [...prev, userMessage]);
    };
    reader.readAsDataURL(file);
  };

  const handleSendVoice = async (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const userMessage: Message = {
      text: "Sent a voice message",
      sender: 'user',
      audio: url
    };
    setMessages(prev => [...prev, userMessage]);
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
        onSendImage={handleSendImage}
        onSendVoice={handleSendVoice}
        isLoading={isLoading}
      />
    </div>
  );
};