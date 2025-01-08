import { Menu, Home, MessageSquare, BookOpen, TestTube } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChatInterface } from "@/components/ChatInterface";
import { ViewType } from "@/types/view";
import { useState } from "react";

const StudyHub = () => {
  const [showChat, setShowChat] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>("pdf");

  const menuItems = [
    { icon: Home, label: "Home" },
    { 
      icon: MessageSquare, 
      label: "Chat",
      onClick: () => {
        setShowChat(true);
        setCurrentView("chat");
      }
    },
    { icon: BookOpen, label: "Flashcard" },
    { icon: TestTube, label: "Test" },
    { icon: BookOpen, label: "Quiz" },
  ];

  if (showChat) {
    return (
      <div className="min-h-screen bg-background">
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border h-16">
          <div className="container mx-auto px-4 h-full flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:bg-accent"
              onClick={() => {
                setShowChat(false);
                setCurrentView("pdf");
              }}
            >
              <Menu className="h-6 w-6 text-primary" />
            </Button>
            <div className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/91f667b0-83b5-4bfe-9318-d58898e35220.png" 
                alt="Logo" 
                className="h-12 w-auto"
              />
            </div>
          </div>
        </header>
        <main className="h-[calc(100vh-4rem)] pt-16">
          <ChatInterface resourceId="" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border h-16">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-accent">
                <Menu className="h-6 w-6 text-primary" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] bg-background/95 backdrop-blur-sm">
              <nav className="flex flex-col gap-4 mt-8">
                <div className="space-y-2">
                  {menuItems.map(({ icon: Icon, label, onClick }) => (
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 hover:bg-accent"
                      key={label}
                      onClick={onClick}
                    >
                      <Icon className="h-5 w-5 text-primary" />
                      {label}
                    </Button>
                  ))}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/91f667b0-83b5-4bfe-9318-d58898e35220.png" 
              alt="Logo" 
              className="h-12 w-auto"
            />
          </div>
        </div>
      </header>
      <main className="h-screen pt-16">
        <div className="container mx-auto px-4 h-full flex items-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
            Your Study Hub
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Organize your study materials and enhance your learning experience
          </p>
        </div>
      </main>
    </div>
  );
};

export default StudyHub;
