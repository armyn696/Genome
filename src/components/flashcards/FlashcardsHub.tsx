import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const FlashcardsHub = () => {
  return (
    <div className="relative z-10 container mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Flashcards</h1>
          <p className="text-muted-foreground">
            Manage, create, and review flashcards for your study set.
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2">
            <Plus className="h-5 w-5" />
            Create Flashcard Set
          </Button>
          <Button variant="outline" className="gap-2">
            Combine
          </Button>
        </div>
      </div>

      {/* Empty State */}
      <Card className="w-full aspect-[2/1] flex flex-col items-center justify-center text-center p-6">
        <img 
          src="/lovable-uploads/0196508e-5858-47f9-8021-812e84b6f347.png" 
          alt="No flashcards" 
          className="w-32 h-32 mb-4"
        />
        <h2 className="text-xl font-semibold mb-2">No Flashcards Found</h2>
        <p className="text-muted-foreground mb-4">
          Create your first flashcard to get started.
        </p>
        <Button className="gap-2">
          <Plus className="h-5 w-5" />
          Create Flashcard
        </Button>
      </Card>
    </div>
  );
};

export default FlashcardsHub;