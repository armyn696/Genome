import { Brain, MessageSquare, BookOpen, GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SplineSceneBasic } from "@/components/ui/splite.demo";
import { useAuthContext } from "@/components/auth/AuthProvider";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { AuthForm } from "@/components/auth/AuthForm";

const features = [
  {
    title: "MindMap",
    description: "Create and organize your study materials visually",
    icon: Brain,
    href: "/mindmap",
    gradient: "from-purple-500/20 to-indigo-500/20",
  },
  {
    title: "Chat with PDF",
    description: "Ask questions and get answers from your study materials",
    icon: MessageSquare,
    href: "/chat",
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    title: "FlashCard",
    description: "Create and review flashcards for effective learning",
    icon: BookOpen,
    href: "/flashcards",
    gradient: "from-emerald-500/20 to-teal-500/20",
  },
  {
    title: "Quiz",
    description: "Test your knowledge with interactive quizzes",
    icon: GraduationCap,
    href: "/quiz",
    gradient: "from-orange-500/20 to-red-500/20",
  },
];

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Top Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#070609] backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/91f667b0-83b5-4bfe-9318-d58898e35220.png" 
              alt="Logo" 
              className="h-12 w-auto"
            />
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Button 
                variant="outline" 
                className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
                onClick={() => navigate('/studyhub')}
              >
                Your Study Hub
              </Button>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  className="text-white hover:text-purple-400 transition-colors"
                  onClick={() => setShowAuthDialog(true)}
                >
                  Sign in
                </Button>
                <Button 
                  variant="ghost"
                  className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 hover:from-purple-500/30 hover:to-indigo-500/30 text-purple-400 hover:text-purple-300 border border-purple-500/50 hover:border-purple-400 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-purple-500/20"
                  onClick={() => navigate('/studyhub')}
                >
                  Your Study Hub
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500/10 rounded-full mix-blend-screen filter blur-xl opacity-70 animate-blob" />
          <div className="absolute top-40 right-10 w-64 h-64 bg-cyan-500/10 rounded-full mix-blend-screen filter blur-xl opacity-70 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-64 h-64 bg-indigo-500/10 rounded-full mix-blend-screen filter blur-xl opacity-70 animate-blob animation-delay-4000" />
        </div>

        <main className="container mx-auto px-4 py-16 relative">
          {/* Hero Section with SplineSceneBasic */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <SplineSceneBasic />
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.a
                key={feature.title}
                href={feature.href}
                className="block group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className={cn(
                  "relative h-full overflow-hidden transition-all duration-300",
                  "hover:shadow-xl hover:-translate-y-1",
                  "border-muted backdrop-blur-sm bg-card/30",
                  "hover:border-accent/50 rounded-xl"
                )}>
                  <CardContent className="p-6">
                    <motion.div 
                      className={cn(
                        "w-16 h-16 rounded-xl mb-6 flex items-center justify-center",
                        "bg-gradient-to-br shadow-lg",
                        feature.gradient
                      )}
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <feature.icon className="w-8 h-8 text-foreground" />
                    </motion.div>
                    <h3 className="text-2xl font-semibold text-foreground mb-3 tracking-tight group-hover:text-accent transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                  <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300",
                    "bg-gradient-to-br",
                    feature.gradient
                  )} />
                </Card>
              </motion.a>
            ))}
          </div>
        </main>
      </div>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-[425px] p-0">
          <AuthForm onSuccess={() => setShowAuthDialog(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;