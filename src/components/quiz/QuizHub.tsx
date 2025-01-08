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
        <h1 className="text-4xl font-bold mb-2">Practice</h1>
        <p className="text-muted-foreground mb-8">Get ready for your test, it's time to practice!</p>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-emerald-600/10 border-emerald-600/20">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-emerald-600/20 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl">Take a Practice Quiz</CardTitle>
              <CardDescription className="text-base">
                Generate a practice quiz from your study set, and test your knowledge.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setCreateDialogOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Create Quiz
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Quizzes</h2>
            <Button variant="outline" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Quiz
            </Button>
          </div>

          <div className="rounded-lg border bg-card p-8 text-center">
            <h3 className="text-xl font-semibold mb-2">No quizzes found</h3>
            <p className="text-muted-foreground mb-4">Create a quiz to get started</p>
            <Button onClick={() => setCreateDialogOpen(true)}>
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