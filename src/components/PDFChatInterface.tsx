import { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Image, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Globe, GraduationCap } from "lucide-react";
import { ChatMessage } from './chat/ChatMessage';
import { ChatWelcome } from './chat/ChatWelcome';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [webBrowsingEnabled, setWebBrowsingEnabled] = useState(false);
  const [academicSearchEnabled, setAcademicSearchEnabled] = useState(false);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      text,
      sender: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setMessage('');

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(message);
    }
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
      <div className="absolute top-4 right-4">
        <img 
          src="/lovable-uploads/91f667b0-83b5-4bfe-9318-d58898e35220.png" 
          alt="Logo" 
          className="h-12 w-auto cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate('/studyhub')}
        />
      </div>
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

      <div className="border-t p-4 bg-background/95 backdrop-blur-sm space-y-2">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <div className="flex items-center gap-2 bg-muted/50 rounded-md px-2 py-1">
            <Globe className="h-4 w-4" />
            <span className="text-xs">Web Browsing</span>
            <Switch
              checked={webBrowsingEnabled}
              onCheckedChange={setWebBrowsingEnabled}
              className="scale-75"
            />
          </div>

          <div className="flex items-center gap-2 bg-muted/50 rounded-md px-2 py-1">
            <GraduationCap className="h-4 w-4" />
            <span className="text-xs">Search Academic Papers</span>
            <Switch
              checked={academicSearchEnabled}
              onCheckedChange={setAcademicSearchEnabled}
              className="scale-75"
            />
          </div>
        </div>

        <div className="max-w-3xl mx-auto flex items-center gap-2 bg-muted rounded-lg p-2">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 hover:bg-background/50"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) handleSendImage(file);
              };
              input.click();
            }}
          >
            <Image className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 hover:bg-background/50"
            onClick={() => {
              // Handle voice recording
              handleSendVoice(new Blob());
            }}
          >
            <Mic className="h-5 w-5" />
          </Button>
          <Textarea
            placeholder="Ask your AI tutor anything..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[44px] resize-none bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
            rows={1}
          />
          <Button
            onClick={() => handleSendMessage(message)}
            size="icon"
            className={cn(
              "shrink-0",
              !message.trim() && "opacity-50 cursor-not-allowed"
            )}
            disabled={!message.trim() || isLoading}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};