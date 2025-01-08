import { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatInput } from './chat/ChatInput';
import { ChatMessage } from './chat/ChatMessage';
import { ChatWelcome } from './chat/ChatWelcome';
import { Button } from './ui/button';
import { FileText, Globe, GraduationCap } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import ResourceList from './ResourceList';

interface Message {
  text: string;
  sender: 'user' | 'ai';
  image?: string;
  audio?: string;
}

interface Resource {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
}

interface EnhancedChatInterfaceProps {
  resources: Resource[];
}

export const EnhancedChatInterface = ({ resources }: EnhancedChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedResources, setSelectedResources] = useState<Resource[]>([]);
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

  const handleResourceSelect = (resource: Resource) => {
    setSelectedResources(prev => {
      const isAlreadySelected = prev.some(r => r.id === resource.id);
      if (isAlreadySelected) {
        return prev.filter(r => r.id !== resource.id);
      }
      return [...prev, resource];
    });
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

      <div className="border-t p-4 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-4 max-w-3xl mx-auto mb-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                {selectedResources.length} material(s) selected
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Materials</DialogTitle>
              </DialogHeader>
              <ResourceList
                resources={resources}
                onResourceSelect={handleResourceSelect}
              />
            </DialogContent>
          </Dialog>

          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="text-sm">Web Browsing</span>
            <Switch
              checked={webBrowsingEnabled}
              onCheckedChange={setWebBrowsingEnabled}
            />
          </div>

          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            <span className="text-sm">Search Academic Papers</span>
            <Switch
              checked={academicSearchEnabled}
              onCheckedChange={setAcademicSearchEnabled}
            />
          </div>
        </div>

        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};