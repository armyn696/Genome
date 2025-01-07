import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Upload, Settings, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import BackgroundScene from "@/components/study-hub/BackgroundScene";
import { cn } from "@/lib/utils";

const StudyHub = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    console.log("Menu toggled:", !isMenuOpen);
  };

  const handleAuthClick = () => {
    setIsLoggedIn(!isLoggedIn);
    console.log("Auth state toggled:", !isLoggedIn);
  };

  return (
    <div className="min-h-screen bg-[#070609] relative overflow-hidden">
      {/* 3D Background */}
      <div className="fixed inset-0 -z-10">
        <Canvas>
          <OrbitControls enableZoom={false} enablePan={false} />
          <BackgroundScene />
        </Canvas>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/91f667b0-83b5-4bfe-9318-d58898e35220.png" 
              alt="Logo" 
              className="h-12 w-auto"
            />
          </div>
          
          <div className="flex items-center gap-4">
            {!isLoggedIn ? (
              <Button 
                variant="ghost" 
                className="text-white hover:text-purple-400 transition-colors"
                onClick={handleAuthClick}
              >
                Sign in
              </Button>
            ) : (
              <Button 
                variant="outline" 
                className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
                onClick={handleAuthClick}
              >
                Log out
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={toggleMenu}
              className="p-2 hover:bg-purple-500/10 transition-colors"
            >
              <Menu className="w-6 h-6 text-purple-400" />
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed top-0 right-0 w-80 h-full z-40 bg-black/30 backdrop-blur-xl border-l border-white/10"
          >
            <div className="p-6 pt-20">
              <nav className="space-y-6">
                <MenuItem icon={Upload} label="Resources" />
                <MenuItem icon={BarChart3} label="Statistics" />
                <MenuItem icon={Settings} label="Settings" />
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Resource Cards */}
          <ResourceCard 
            title="Upload Documents"
            description="Upload and manage your study materials"
            icon={Upload}
          />
          <ResourceCard 
            title="Study Statistics"
            description="Track your learning progress"
            icon={BarChart3}
          />
          <ResourceCard 
            title="Settings"
            description="Customize your study environment"
            icon={Settings}
          />
        </div>
      </main>
    </div>
  );
};

// Helper Components
const MenuItem = ({ icon: Icon, label }: { icon: any; label: string }) => (
  <motion.button
    whileHover={{ x: 5 }}
    className="flex items-center gap-3 text-white/80 hover:text-white w-full p-2 rounded-lg hover:bg-white/5 transition-colors"
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </motion.button>
);

const ResourceCard = ({ title, description, icon: Icon }: { title: string; description: string; icon: any }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="p-6 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-purple-500/50 transition-colors"
  >
    <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-purple-400" />
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-white/60">{description}</p>
  </motion.div>
);

export default StudyHub;