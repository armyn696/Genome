import { Menu, Home, MessageSquare, BookOpen, TestTube, Plus, FileText, Mic2, Video, AudioLines, Image, Text, LayoutList } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import Background from "@/components/Background";
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
  const [currentView, setCurrentView] = useState<'notes' | 'pdf' | 'transcript' | 'dual'>('pdf');

  const handleResourceAdd = (newResource: Resource) => {
    setResources(prev => [...prev, newResource]);
  };

  const handleResourceSelect = (resource: Resource) => {
    setSelectedResource(resource);
  };

  const menuItems = [
    { icon: Home, label: "Home" },
    { icon: MessageSquare, label: "Chat" },
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

  const renderMenuItem = (Icon: any, label: string) => (
    <Button
      variant="ghost"
      className="w-full justify-start gap-2 hover:bg-accent"
      key={label}
    >
      <Icon className="h-5 w-5 text-primary" />
      {label}
    </Button>
  );
  
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Background />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Dashboard Menu Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-accent">
                <Menu className="h-6 w-6 text-primary" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] bg-background/95 backdrop-blur-sm">
              <nav className="flex flex-col gap-4 mt-8">
                {/* Main Menu Items */}
                <div className="space-y-2">
                  {menuItems.map(({ icon: Icon, label }) => renderMenuItem(Icon, label))}
                </div>

                {/* Separator */}
                <Separator className="my-2" />

                {/* Resources Section */}
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
                  
                  {/* Add Resource Button */}
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

          {/* Logo */}
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/91f667b0-83b5-4bfe-9318-d58898e35220.png" 
              alt="Logo" 
              className="h-12 w-auto"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24">
        {selectedResource ? (
          <>
            <PDFViewerNav currentView={currentView} onViewChange={setCurrentView} />
            <ResizablePanelGroup direction="horizontal" className="min-h-[80vh] rounded-lg border">
              <ResizablePanel defaultSize={60} minSize={30}>
                <PDFContent currentView={currentView} resourceId={selectedResource.id} />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={40} minSize={30}>
                <ChatInterface resourceId={selectedResource.id} />
              </ResizablePanel>
            </ResizablePanelGroup>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
              Your Study Hub
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Organize your study materials and enhance your learning experience
            </p>
            <ResourceList resources={resources} onResourceSelect={handleResourceSelect} />
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default StudyHub;
