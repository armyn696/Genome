import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import CreateQuizDialog from "./CreateQuizDialog";

const QuizHub = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Mock resources - in a real app, these would come from props or a data store
  const mockResources = [
    { id: "1", name: "Physics Notes.pdf", type: "pdf" },
    { id: "2", name: "Chemistry Chapter 1.pdf", type: "pdf" },
    { id: "3", name: "Math Formulas.pdf", type: "pdf" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2 text-white">Practice</h1>
        <p className="text-gray-300 mb-8">Get ready for your test, it's time to practice!</p>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-purple-900/30 border-purple-500/50 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-purple-400" />
              </div>
              <CardTitle className="text-2xl text-white">Take a Practice Quiz</CardTitle>
              <CardDescription className="text-base text-gray-300">
                Generate a practice quiz from your study set, and test your knowledge.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setCreateDialogOpen(true)}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                Create Quiz
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Quizzes</h2>
            <Button 
              variant="outline" 
              onClick={() => setCreateDialogOpen(true)}
              className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Quiz
            </Button>
          </div>

          <div className="rounded-lg border border-purple-500/50 bg-purple-900/30 backdrop-blur-sm p-8 text-center">
            <h3 className="text-xl font-semibold mb-2 text-white">No quizzes found</h3>
            <p className="text-gray-300 mb-4">Create a quiz to get started</p>
            <Button 
              onClick={() => setCreateDialogOpen(true)}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              Create Practice Quiz
            </Button>
          </div>
        </div>

        <CreateQuizDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          resources={mockResources}
        />
      </motion.div>
    </div>
  );
};

export default QuizHub;