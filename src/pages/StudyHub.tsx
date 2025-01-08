import { StudyHubSidebar } from "@/components/studyhub/StudyHubSidebar";
import { EnhancedChatInterface } from "@/components/EnhancedChatInterface";
import FeaturesSection from "@/components/studyhub/FeaturesSection";
import { useState } from "react";

const StudyHub = () => {
  const [showFeatures, setShowFeatures] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      <StudyHubSidebar onShowFeatures={() => setShowFeatures(true)} />
      <div className="flex-1 p-6">
        {showFeatures ? (
          <FeaturesSection />
        ) : (
          <EnhancedChatInterface />
        )}
      </div>
    </div>
  );
};

export default StudyHub;