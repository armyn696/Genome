import { StudyHubSidebar } from "@/components/studyhub/StudyHubSidebar";
import { EnhancedChatInterface } from "@/components/EnhancedChatInterface";
import FeaturesSection from "@/components/studyhub/FeaturesSection";
import { useState } from "react";

const StudyHub = () => {
  const [showFeatures, setShowFeatures] = useState(false);
  const [resources] = useState<Array<{
    id: string;
    name: string;
    type: string;
    size: string;
    uploadDate: string;
  }>>([]);

  return (
    <div className="flex min-h-screen w-full">
      <StudyHubSidebar onShowFeatures={() => setShowFeatures(true)} />
      <div className="flex-1 p-6">
        {showFeatures ? (
          <FeaturesSection />
        ) : (
          <EnhancedChatInterface resources={resources} />
        )}
      </div>
    </div>
  );
};

export default StudyHub;