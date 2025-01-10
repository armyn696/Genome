import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import StudyHub from "./pages/StudyHub";
import ChatPage from "./pages/ChatPage";
import QuizPage from "./pages/QuizPage";
import FlashcardsPage from "./pages/FlashcardsPage";
import MindmapPage from "./pages/MindmapPage";
import MatchGamePage from "./pages/MatchGamePage";
import ResourcesPage from "./pages/ResourcesPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/studyhub" element={<StudyHub />} />
        <Route path="/studyhub/resources" element={<ResourcesPage />} />
        <Route path="/studyhub/chat" element={<ChatPage />} />
        <Route path="/studyhub/quiz" element={<QuizPage />} />
        <Route path="/studyhub/flashcards" element={<FlashcardsPage />} />
        <Route path="/studyhub/mindmap" element={<MindmapPage />} />
        <Route path="/studyhub/matchgame" element={<MatchGamePage />} />
      </Routes>
    </Router>
  );
}

export default App;