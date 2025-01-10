import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Home, MessageSquare, BookOpen, Plus, Bookmark, Trees, Gamepad } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SidebarMenuItem } from "./SidebarMenuItem";
import ResourceUploader from "../ResourceUploader";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Resource {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
}

interface StudyHubSidebarProps {
  resources: Resource[];
  onResourceAdd: (resource: Resource) => void;
  onResourceSelect: (resource: Resource) => void;
  onViewChange: (view: 'home' | 'chat' | 'notes' | 'pdf' | 'transcript' | 'dual' | 'quiz' | 'flashcards' | 'mindmap' | 'matchgame') => void;
}

export const StudyHubSidebar = ({ resources, onResourceAdd, onResourceSelect, onViewChange }: StudyHubSidebarProps) => {
  const navigate = useNavigate();

  const menuItems = [
    { icon: Home, label: "Home", onClick: () => navigate('/studyhub') },
    { icon: MessageSquare, label: "Chat", onClick: () => navigate('/chat') },
    { icon: BookOpen, label: "Quiz", onClick: () => navigate('/quiz') },
    { icon: Bookmark, label: "Flashcards", onClick: () => navigate('/flashcards') },
    { icon: Trees, label: "Mind Maps", onClick: () => navigate('/mindmap') },
    { icon: Gamepad, label: "Match Game", onClick: () => navigate('/matchgame') },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-accent">
          <Menu className="h-6 w-6 text-primary" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] bg-background/95 backdrop-blur-sm">
        <nav className="flex flex-col gap-4 mt-8">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <SidebarMenuItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                onClick={item.onClick}
              />
            ))}
          </div>

          <Separator className="my-2" />

          <div className="space-y-2">
            <div className="flex items-center gap-2 px-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-medium">Resources</span>
            </div>
            
            <div className="space-y-2">
              {resources.map(resource => (
                <Button
                  key={resource.id}
                  variant="ghost"
                  className="w-full justify-start gap-2 hover:bg-accent"
                  onClick={() => onResourceSelect(resource)}
                >
                  <FileText className="h-5 w-5 text-primary" />
                  {resource.name}
                </Button>
              ))}
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 border-primary/50 hover:bg-primary/10"
                >
                  <Plus className="h-5 w-5 text-primary" />
                  Add Resource
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px] bg-background/95 backdrop-blur-sm">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-center mb-4">Add Material</DialogTitle>
                </DialogHeader>
                <ResourceUploader onResourceAdd={onResourceAdd} />
              </DialogContent>
            </Dialog>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
};