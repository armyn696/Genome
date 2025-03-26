import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import Index from "./pages/Index";
import Mindmap from "./pages/Mindmap";
import StudyHub from "./pages/StudyHub";
import ChatPage from "./pages/ChatPage";
import QuizPage from "./pages/QuizPage";
import FlashcardsPage from "./pages/FlashcardsPage";
import MindmapPage from "./pages/MindmapPage";
import MatchGamePage from "./pages/MatchGamePage";
import PDFPage from "./pages/PDFPage";
import TeachPage from "./pages/TeachPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/mindmap" element={<Mindmap />} />
            <Route path="/studyhub" element={<StudyHub />} />
            <Route path="/studyhub/chat" element={<ChatPage />} />
            <Route path="/studyhub/resources/pdf/:resourceId" element={<PDFPage />} />
            <Route path="/studyhub/quiz" element={<QuizPage />} />
            <Route path="/studyhub/flashcards" element={<FlashcardsPage />} />
            <Route path="/studyhub/mindmap" element={<MindmapPage />} />
            <Route path="/studyhub/matchgame" element={<MatchGamePage />} />
            <Route path="/studyhub/teach" element={<TeachPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;