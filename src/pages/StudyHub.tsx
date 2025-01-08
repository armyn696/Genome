import { useState } from "react";
import { Menu, Home, MessageSquare, BookOpen, TestTube, Plus } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import Background from "@/components/Background";
import ResourceList from "@/components/ResourceList";
import ResourceUploader from "@/components/ResourceUploader";
import ChatInterface from "@/components/ChatInterface";
import PDFViewer from "@/components/PDFViewer";

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
  
  const handleResourceAdd = (newResource: Resource) => {
    setResources(prev => [...prev, newResource]);
    setSelectedResource(newResource); // Automatically select newly uploaded resource
  };

  const handleResourceClick = (resource: Resource) => {
    setSelectedResource(resource);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-accent">
                <Menu className="h-6 w-6 text-primary" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] bg-background/95 backdrop-blur-sm">
              <nav className="flex flex-col gap-4 mt-8">
                <div className="space-y-2">
                  {[
                    { icon: Home, label: "Home" },
                    { icon: MessageSquare, label: "Chat" },
                    { icon: BookOpen, label: "Flashcard" },
                    { icon: TestTube, label: "Test" },
                    { icon: BookOpen, label: "Quiz" },
                  ].map(({ icon: Icon, label }) => (
                    <Button
                      key={label}
                      variant="ghost"
                      className="w-full justify-start gap-2 hover:bg-accent"
                    >
                      <Icon className="h-5 w-5 text-primary" />
                      {label}
                    </Button>
                  ))}
                </div>

                <Separator className="my-2" />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span className="font-medium">Resources</span>
                  </div>
                  
                  <ResourceList resources={resources} onResourceClick={handleResourceClick} />
                  
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
                        <DialogTitle>Add Material</DialogTitle>
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

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24 pb-8">
        {selectedResource ? (
          <div className="min-h-[calc(100vh-8rem)] bg-background/95 backdrop-blur-sm rounded-lg border shadow-lg overflow-hidden">
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel defaultSize={60} minSize={40}>
                <PDFViewer 
                  resourceId={selectedResource.id} 
                  resourceName={selectedResource.name} 
                />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={40} minSize={30}>
                <ChatInterface resourceName={selectedResource.name} />
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center py-20"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
              Your Study Hub
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Upload a PDF to start studying with AI assistance
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="bg-primary/90 hover:bg-primary text-primary-foreground"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Upload PDF
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px] bg-background/95 backdrop-blur-sm">
                <DialogHeader>
                  <DialogTitle>Add Material</DialogTitle>
                </DialogHeader>
                <ResourceUploader onResourceAdd={handleResourceAdd} />
              </DialogContent>
            </Dialog>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default StudyHub;