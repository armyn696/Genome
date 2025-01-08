import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ChatInterfaceProps {
  resourceName: string;
}

const ChatInterface = ({ resourceName }: ChatInterfaceProps) => {
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-foreground">Chat with AI about {resourceName}</h2>
        <p className="text-muted-foreground mt-2">
          Ask questions about the content of your document and get instant answers.
        </p>
      </div>
      
      <div className="flex-1 overflow-auto p-6 bg-white/5">
        {/* Chat messages will go here */}
        <div className="text-muted-foreground text-center mt-8">
          Start asking questions about your document
        </div>
      </div>

      <div className="p-4 border-t bg-background/95">
        <div className="flex gap-2">
          <Input 
            placeholder="Type your question here..." 
            className="flex-1 bg-white/10"
          />
          <Button className="bg-primary hover:bg-primary/90">
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;