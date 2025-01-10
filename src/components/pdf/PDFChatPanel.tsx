import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { useEffect, useRef } from "react";

interface Message {
  text: string;
  sender: 'user' | 'ai';
}

interface PDFChatPanelProps {
  messages: Message[];
  message: string;
  setMessage: (message: string) => void;
  handleSendMessage: () => void;
}

export const PDFChatPanel = ({
  messages,
  message,
  setMessage,
  handleSendMessage,
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
    <div className="flex-1 bg-gray-50 flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 flex flex-col">
          {messages.map((msg, index) => (
            <ChatMessage 
              key={index} 
              text={msg.text}
              sender={msg.sender}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
        <ScrollBar />
      </ScrollArea>

      <div className="border-t p-2">
        <ChatInput
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};