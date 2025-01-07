import { Menu, Home, MessageSquare, BookOpen, TestTube, Plus, FileText, Mic, Youtube, FileAudio, FileVideo, Image, Text, BarChart } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Background from "@/components/Background";
import ResourceList from "@/components/ResourceList";
import ResourceUploader from "@/components/ResourceUploader";
import { useState } from "react";

interface Resource {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
}

const StudyHub = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  console.log("Rendering StudyHub page");
  
  const handleResourceAdd = (newResource: Resource) => {
    setResources(prev => [...prev, newResource]);
    console.log("Resources updated:", [...resources, newResource]);
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
    { icon: Mic, label: "Record Live Lecture" },
    { icon: Youtube, label: "YouTube Video" },
    { icon: FileAudio, label: "Upload Audio", description: "mp3, wav" },
    { icon: FileVideo, label: "Upload Video", description: "mp4" },
    { icon: BookOpen, label: "Google Docs" },
    { icon: Image, label: "Handwritten Notes" },
    { icon: FileText, label: "Blank Document" },
    { icon: Text, label: "Paste Notes" },
    { icon: BookOpen, label: "Quizlet Set" },
    { icon: BarChart, label: "Essay Grader" },
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
                  
                  <ResourceList resources={resources} />
                  
                  {/* Add Resource Button with Modal */}
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
                        <p className="text-sm text-muted-foreground text-center mb-6">
                          Material you add will be used to personalize StudyFetch with your class material, which can then be used to create flashcards, quizzes, tests, chat with an AI tutor, etc.
                        </p>
                      </DialogHeader>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {resourceTypes.map(({ icon: Icon, label, description, component: Component }) => (
                          <Dialog key={label}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                className="h-auto py-6 flex flex-col items-center gap-3 hover:bg-primary/10 hover:border-primary transition-colors"
                              >
                                <Icon className="h-8 w-8 text-primary" />
                                <div className="text-center">
                                  <div className="font-semibold">{label}</div>
                                  {description && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {description}
                                    </div>
                                  )}
                                </div>
                              </Button>
                            </DialogTrigger>
                            {Component && (
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>{label}</DialogTitle>
                                </DialogHeader>
                                <Component onResourceAdd={handleResourceAdd} />
                              </DialogContent>
                            )}
                          </Dialog>
                        ))}
                      </div>
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
        </motion.div>
      </main>
    </div>
  );
};

export default StudyHub;