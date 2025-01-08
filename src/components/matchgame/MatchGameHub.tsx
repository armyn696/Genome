import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { useState } from "react";

const MatchGameHub = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2">Match Game</h1>
        <p className="text-muted-foreground mb-8">Create engaging matching games to test your knowledge!</p>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-purple-600/10 border-purple-600/20">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <span>🎮</span> Create Match Game
              </CardTitle>
              <CardDescription className="text-base">
                Create a new match game to test your knowledge
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Create Game
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Match Game</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <Card className="cursor-pointer hover:bg-accent transition-colors p-4 text-center">
                      <div className="text-4xl mb-2">✏️</div>
                      <h3 className="font-semibold mb-1">Start From Scratch</h3>
                      <p className="text-sm text-muted-foreground">
                        Create your match game manually
                      </p>
                    </Card>
                    <Card className="cursor-pointer hover:bg-accent transition-colors p-4 text-center">
                      <div className="text-4xl mb-2">📚</div>
                      <h3 className="font-semibold mb-1">Create From Material</h3>
                      <p className="text-sm text-muted-foreground">
                        Generate from your uploaded resources
                      </p>
                    </Card>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Your Match Games</h2>
            <Button variant="outline" onClick={() => setCreateDialogOpen(true)}>
              Create Game
            </Button>
          </div>

          <div className="rounded-lg border bg-card p-8 text-center">
            <h3 className="text-xl font-semibold mb-2">No match games found</h3>
            <p className="text-muted-foreground mb-4">Create a game to get started</p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              Create Match Game
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MatchGameHub;