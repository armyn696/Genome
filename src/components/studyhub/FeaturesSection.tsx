import { MessageCircle, Layers, CheckSquare, Network, Gamepad2, GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const FeaturesSection = () => {
  const navigate = useNavigate();

  const features = [
    {
      name: "Chat",
      description: "Chat with your AI tutor",
      icon: <MessageCircle className="w-12 h-12 text-primary" />,
      route: "/studyhub/chat"
    },
    {
      name: "Flashcards",
      description: "Learn with flashcards",
      icon: <Layers className="w-12 h-12 text-primary" />,
      route: "/studyhub/flashcards"
    },
    {
      name: "Quiz",
      description: "Test your knowledge",
      icon: <CheckSquare className="w-12 h-12 text-primary" />,
      route: "/studyhub/quiz"
    },
    {
      name: "Mind Map",
      description: "Visualize your learning",
      icon: <Network className="w-12 h-12 text-primary" />,
      route: "/studyhub/mindmap"
    },
    {
      name: "Match Game",
      description: "Learn by matching",
      icon: <Gamepad2 className="w-12 h-12 text-primary" />,
      route: "/studyhub/matchgame"
    },
    {
      name: "Teach Me",
      description: "Get personalized lessons",
      icon: <GraduationCap className="w-12 h-12 text-primary" />,
      route: "/studyhub/teach"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16 relative">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="block group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => feature.route && navigate(feature.route)}
            style={{ cursor: feature.route ? 'pointer' : 'default' }}
          >
            <Card className="relative h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-muted backdrop-blur-sm bg-card/30 hover:border-accent/50 rounded-xl">
              <CardContent className="p-6">
                <motion.div 
                  className="w-16 h-16 rounded-xl mb-6 flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-indigo-500/20 shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-2xl font-semibold text-foreground mb-3 tracking-tight group-hover:text-accent transition-colors">
                  {feature.name}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br from-purple-500/20 to-indigo-500/20" />
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FeaturesSection;