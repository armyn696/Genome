import { TutorViewer } from './TutorViewer';
import { TutorChatPanel } from './TutorChatPanel';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useState } from "react";
import { Resource } from "@/types";

interface TutorSessionProps {
  resource: Resource;
  onClose: () => void;
}

const TutorSession = ({ resource, onClose }: TutorSessionProps) => {
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'ai', image?: string }[]>([]);
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const userMessage = {
      text: message,
      sender: 'user' as const
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        text: "I'm here to help you understand the PDF content. What would you like to know?",
        sender: 'ai' as const
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const handleDrawingComplete = (imageData: string) => {
    const userMessage = {
      text: "Here's my drawing on the slide:",
      sender: 'user' as const,
      image: imageData
    };
    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        text: "I can see your drawing. What would you like me to explain about this part of the content?",
        sender: 'ai' as const
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  return (
    <div className="h-[calc(100vh-64px)] w-full bg-background overflow-hidden">
      <ResizablePanelGroup 
        direction="horizontal" 
        className="h-full"
      >
        <ResizablePanel 
          defaultSize={50} 
          minSize={30}
          className="h-full"
        >
          <div className="h-full bg-black overflow-hidden">
            <TutorViewer resourceId={resource.id} onDrawingComplete={handleDrawingComplete} />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel 
          defaultSize={50} 
          minSize={30}
          className="h-full"
        >
          <div className="h-full bg-black overflow-hidden">
            <TutorChatPanel
              messages={messages}
              message={message}
              setMessage={setMessage}
              handleSendMessage={handleSendMessage}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default TutorSession;
