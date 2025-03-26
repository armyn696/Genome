import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

const FlashcardsHub = () => {
  return (
    <div className="container mx-auto px-4 py-8 relative z-10">
      {/* Practice Section */}
      <section className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-2">Practice</h1>
        <p className="text-gray-300 mb-8">Get ready to memorize and learn!</p>

        <div className="bg-[#0A1122]/80 rounded-lg p-8 border border-white/10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white mb-1">Create Flashcards</h2>
              <p className="text-gray-300">Create a new set of flashcards to practice your knowledge.</p>
            </div>
          </div>
          <Button 
            className="bg-purple-500 hover:bg-purple-600 text-white"
            onClick={() => {/* TODO: Implement create flashcards */}}
          >
            Create Flashcards
          </Button>
        </div>
      </section>

      {/* Flashcards List Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Flashcard Sets</h2>
          <Button 
            variant="outline" 
            className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
            onClick={() => {/* TODO: Implement create flashcards */}}
          >
            <span className="mr-2">+</span> Create Flashcards
          </Button>
        </div>

        <div className="bg-black/40 rounded-lg p-12 border border-white/10 flex flex-col items-center justify-center">
          <h3 className="text-xl text-gray-300 mb-4">No flashcard sets found</h3>
          <p className="text-gray-400 mb-6">Create a flashcard set to get started</p>
          <Button 
            className="bg-purple-500 hover:bg-purple-600 text-white"
            onClick={() => {/* TODO: Implement create flashcards */}}
          >
            Create Flashcards
          </Button>
        </div>
      </section>
    </div>
  );
};

export default FlashcardsHub;