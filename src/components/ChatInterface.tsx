import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/pdf/ChatMessage";
import { ChatInput } from "@/components/pdf/ChatInput";
import { Message } from "@/types/chat";

interface ChatInterfaceProps {
  resourceName: string;
}

const ChatInterface = ({ resourceName }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSendMessage = (text: string) => {
    if (text.trim()) {
      const newMessage: Message = {
        text: text.trim(),
        sender: 'user'
      };
      setMessages(prev => [...prev, newMessage]);
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          text: "این یک پاسخ نمونه است. شما می‌توانید به صفحات [p.1] و [p.2, 3] مراجعه کنید.",
          sender: 'ai'
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 flex flex-col">
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <ChatInput
        message={message}
        setMessage={setMessage}
        handleSendMessage={handleSendMessage}
        isWebSearchEnabled={isWebSearchEnabled}
        setIsWebSearchEnabled={setIsWebSearchEnabled}
      />
    </div>
  );
};

export default ChatInterface;