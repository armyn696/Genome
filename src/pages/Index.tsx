import { Brain, MessageSquare, BookOpen, GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
  console.log("Rendering Index page");
  
  return (
    <div className="min-h-screen bg-background relative">
      {/* Top Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#1A1F2C]/95 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/f5d42817-6fe0-4216-bbce-598f42a41291.png" 
              alt="Logo" 
              className="h-8 w-auto"
            />
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-white hover:text-purple-400 transition-colors">
              Sign in
            </Button>
            <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/10">
              Log out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content with padding-top to account for fixed banner */}
      <div className="pt-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500/10 rounded-full mix-blend-screen filter blur-xl opacity-70 animate-blob" />
          <div className="absolute top-40 right-10 w-64 h-64 bg-cyan-500/10 rounded-full mix-blend-screen filter blur-xl opacity-70 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-64 h-64 bg-indigo-500/10 rounded-full mix-blend-screen filter blur-xl opacity-70 animate-blob animation-delay-4000" />
        </div>

        <main className="container mx-auto px-4 py-16 relative">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center mb-8"
          >
            <img 
              src="/lovable-uploads/f5d42817-6fe0-4216-bbce-598f42a41291.png" 
              alt="Atom Logo" 
              className="h-24 w-auto"
            />
          </motion.div>

          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400 tracking-tight">
              Your Interactive Learning Platform
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Enhance your learning experience with our suite of interactive study tools
            </p>
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
    </div>
  );
};

export default Index;