import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Index from "./pages/Index";
import Mindmap from "./pages/Mindmap";
import StudyHub from "./pages/StudyHub";
import ChatPage from "./pages/ChatPage";
import QuizPage from "./pages/QuizPage";
import FlashcardsPage from "./pages/FlashcardsPage";
import MindmapPage from "./pages/MindmapPage";
import MatchGamePage from "./pages/MatchGamePage";

interface Resource {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
}

const queryClient = new QueryClient();

const App = () => {
  const [resources, setResources] = useState<Resource[]>([]);

  const handleResourceAdd = (newResource: Resource) => {
    setResources(prev => [...prev, newResource]);
  };

  const handleResourceDelete = (resourceId: string) => {
    setResources(prev => prev.filter(resource => resource.id !== resourceId));
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/mindmap" element={<Mindmap />} />
            <Route 
              path="/studyhub" 
              element={
                <StudyHub 
                  resources={resources}
                  onResourceAdd={handleResourceAdd}
                  onResourceDelete={handleResourceDelete}
                />
              } 
            />
            <Route 
              path="/studyhub/chat" 
              element={
                <ChatPage 
                  resources={resources}
                  onResourceAdd={handleResourceAdd}
                  onResourceDelete={handleResourceDelete}
                />
              } 
            />
            <Route 
              path="/studyhub/quiz" 
              element={
                <QuizPage 
                  resources={resources}
                  onResourceAdd={handleResourceAdd}
                  onResourceDelete={handleResourceDelete}
                />
              } 
            />
            <Route 
              path="/studyhub/flashcards" 
              element={
                <FlashcardsPage 
                  resources={resources}
                  onResourceAdd={handleResourceAdd}
                  onResourceDelete={handleResourceDelete}
                />
              } 
            />
            <Route 
              path="/studyhub/mindmap" 
              element={
                <MindmapPage 
                  resources={resources}
                  onResourceAdd={handleResourceAdd}
                  onResourceDelete={handleResourceDelete}
                />
              } 
            />
            <Route 
              path="/studyhub/matchgame" 
              element={
                <MatchGamePage 
                  resources={resources}
                  onResourceAdd={handleResourceAdd}
                  onResourceDelete={handleResourceDelete}
                />
              } 
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;