import { Button } from "@/components/ui/button";
import { StudyHubSidebar } from "./StudyHubSidebar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Resource } from "@/types";

interface StudyHubHeaderProps {
  resources: Resource[];
  onResourceAdd: (resource: Resource) => void;
  onResourceSelect: (resource: Resource) => void;
  onViewChange: (view: 'home' | 'chat' | 'notes' | 'pdf' | 'transcript' | 'dual' | 'quiz' | 'flashcards' | 'mindmap' | 'matchgame' | 'teach') => void;
  onResourceRename?: (resourceId: string, newName: string) => void;
}

export const StudyHubHeader = ({ resources, onResourceAdd, onResourceSelect, onViewChange, onResourceRename }: StudyHubHeaderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const handleAuthClick = () => {
    setIsLoggedIn(!isLoggedIn);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#070609] backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <StudyHubSidebar
          resources={resources}
          onResourceAdd={onResourceAdd}
          onResourceSelect={onResourceSelect}
          onViewChange={onViewChange}
          onResourceRename={onResourceRename}
        />
        <div className="flex-1" /> {/* این div برای ایجاد فاصله بین منو و دکمه‌هاست */}
        <div className="flex items-center gap-4">
          {!isLoggedIn ? (
            <Button 
              variant="ghost" 
              className="text-white hover:text-purple-400 transition-colors"
              onClick={handleAuthClick}
            >
              Sign in
            </Button>
          ) : (
            <Button 
              variant="outline" 
              className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
              onClick={handleAuthClick}
            >
              Log out
            </Button>
          )}
          <img 
            src="/lovable-uploads/91f667b0-83b5-4bfe-9318-d58898e35220.png" 
            alt="Logo" 
            className="h-12 w-auto cursor-pointer"
            onClick={() => navigate('/studyhub')}
          />
        </div>
      </div>
    </div>
  );
};
