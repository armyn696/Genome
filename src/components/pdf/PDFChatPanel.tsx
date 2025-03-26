import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { useEffect, useRef } from "react";

interface Message {
  text: string;
  sender: 'user' | 'ai';
  image?: string;
}

interface PDFChatPanelProps {
  messages: Message[];
  message: string;
  setMessage: (message: string) => void;
  handleSendMessage: () => void;
  isLoading?: boolean;
}

export const PDFChatPanel = ({
  messages,
  message,
  setMessage,
  handleSendMessage,
  isLoading = false,
}: PDFChatPanelProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-full">
      <ScrollArea className="flex-1 pb-0">
        <div className="space-y-4 flex flex-col p-4">
          {messages.map((msg, index) => (
            <div 
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-3`}>
                <p>{msg.text}</p>
                {msg.image && (
                  <img 
                    src={msg.image} 
                    alt="User drawing" 
                    className="mt-2 max-w-full rounded"
                  />
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] bg-muted rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <div className="border-t mt-auto">
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          value={message}
          onChange={setMessage}
        />
      </div>
    </div>
  );
};