import { motion } from "framer-motion";
import { FeaturesSection } from "./FeaturesSection";
import ResourceList from "../ResourceList";

interface Resource {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
}

interface HomePageProps {
  resources: Resource[];
  onResourceSelect: (resource: Resource) => void;
}

export const HomePage = ({ resources, onResourceSelect }: HomePageProps) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-12"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2">Welcome to StudyHub</h1>
          <p className="text-muted-foreground">Explore our features and manage your study resources</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Features</h2>
          <FeaturesSection />
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Your Resources</h2>
          <ResourceList resources={resources} onResourceSelect={onResourceSelect} />
        </div>
      </motion.div>
    </div>
  );
};