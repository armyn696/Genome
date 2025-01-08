import { Menu, Home, MessageSquare, BookOpen, TestTube, Plus, FileText, Mic2, Video, AudioLines, Image, Text, LayoutList } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import ResourceList from "@/components/ResourceList";
import ResourceUploader from "@/components/ResourceUploader";
import { useState } from "react";
import { ChatInterface } from "@/components/ChatInterface";
import { PDFViewerNav } from "@/components/PDFViewerNav";
import { PDFContent } from "@/components/PDFContent";

interface Resource {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
}

const StudyHub = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [currentView, setCurrentView] = useState<'notes' | 'pdf' | 'transcript' | 'dual' | 'chat'>('pdf');
  const [showChat, setShowChat] = useState(false);

  const handleResourceAdd = (newResource: Resource) => {
    setResources(prev => [...prev, newResource]);
  };

  const handleResourceSelect = (resource: Resource) => {
    setSelectedResource(resource);
  };

  const menuItems = [
    { icon: Home, label: "Home" },
    { 
      icon: MessageSquare, 
      label: "Chat",
      onClick: () => {
        setShowChat(true);
        setCurrentView('chat');
      }
    },
    { icon: BookOpen, label: "Flashcard" },
    { icon: TestTube, label: "Test" },
    { icon: BookOpen, label: "Quiz" },
  ];

  const resourceTypes = [
    { 
      icon: FileText, 
      label: "Upload Documents", 
      description: "pdf, pptx, docx", 
      component: (props: any) => <ResourceUploader onResourceAdd={props.onResourceAdd} /> 
    },
    { icon: Mic2, label: "Record Live Lecture" },
    { icon: Video, label: "YouTube Video" },
    { icon: AudioLines, label: "Upload Audio", description: "mp3, wav" },
    { icon: Video, label: "Upload Video", description: "mp4" },
    { icon: BookOpen, label: "Google Docs" },
    { icon: Image, label: "Handwritten Notes" },
    { icon: FileText, label: "Blank Document" },
    { icon: Text, label: "Paste Notes" },
    { icon: BookOpen, label: "Quizlet Set" },
    { icon: LayoutList, label: "Essay Grader" },
    { icon: BookOpen, label: "Brightspace" },
    { icon: BookOpen, label: "Canvas" },
  ];

  const renderMenuItem = (Icon: any, label: string, onClick?: () => void) => (
    <Button
      variant="ghost"
      className="w-full justify-start gap-2 hover:bg-accent"
      key={label}
      onClick={onClick}
    >
      <Icon className="h-5 w-5 text-primary" />
      {label}
    </Button>
  );

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
                setCurrentView('pdf');
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
        <main className="container mx-auto px-4 pt-24 h-[calc(100vh-4rem)]">
          <div className="max-w-4xl mx-auto h-full">
            <div className="flex flex-col items-center justify-center mb-8">
              <img
                src="/lovable-uploads/ea974bf0-54b5-4e40-9981-0d849bfccbf7.png"
                alt="AI Assistant"
                className="w-16 h-16 rounded-full mb-4"
              />
              <h1 className="text-2xl font-bold mb-2">Hi, I'm Spark.E</h1>
              <p className="text-muted-foreground text-center">
                Ask me anything about learning, or try one of these examples:
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 mb-8">
              <Button
                variant="outline"
                className="h-auto py-4 px-6 text-left flex items-start gap-4"
              >
                <span className="text-primary text-lg">💡</span>
                <span>Find me 3 insightful quotes from the materials I selected</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 px-6 text-left flex items-start gap-4"
              >
                <span className="text-primary text-lg">💡</span>
                <span>What is the main idea of the materials I selected?</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 px-6 text-left flex items-start gap-4 md:col-span-2"
              >
                <span className="text-primary text-lg">💡</span>
                <span>Summarize my course materials for me like I'm 5 years old</span>
              </Button>
            </div>
            <ChatInterface resourceId="" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ... keep existing code (header and main content) */}
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
                  {menuItems.map(({ icon: Icon, label, onClick }) => renderMenuItem(Icon, label, onClick))}
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
                        onClick={() => handleResourceSelect(resource)}
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
                      <ResourceUploader onResourceAdd={handleResourceAdd} />
                    </DialogContent>
                  </Dialog>
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
        {selectedResource ? (
          <div className="h-full bg-black">
            <div className="h-full">
              <PDFViewerNav currentView={currentView} onViewChange={setCurrentView} />
              <div className="h-[calc(100vh-7rem)]">
                <ResizablePanelGroup direction="horizontal" className="h-full">
                  <ResizablePanel defaultSize={60} minSize={30}>
                    <PDFContent currentView={currentView} resourceId={selectedResource.id} />
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={40} minSize={30}>
                    <ChatInterface resourceId={selectedResource.id} />
                  </ResizablePanel>
                </ResizablePanelGroup>
              </div>
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-4 h-full flex items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center w-full"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
                Your Study Hub
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Organize your study materials and enhance your learning experience
              </p>
              <ResourceList resources={resources} onResourceSelect={handleResourceSelect} />
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudyHub;
