import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";
import TeachResourceList from "./TeachResourceList";
import TutorSession from "./TutorSession";
import { useResources } from "@/hooks/useResources";
import { useState } from "react";
import { Resource } from "@/types";

const TeachHub = () => {
  const { resources } = useResources();
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const handleStartTutorSession = (resource: Resource) => {
    setSelectedResource(resource);
  };

  const handleCloseTutorSession = () => {
    setSelectedResource(null);
  };

  if (selectedResource) {
    return <TutorSession resource={selectedResource} onClose={handleCloseTutorSession} />;
  }

  return (
    <div className="container mx-auto px-4 py-8 relative z-10">
      {/* Header Section */}
      <section className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-2">Teach Me</h1>
        <p className="text-gray-400 mb-8">Select a resource to start your personalized learning journey!</p>
      </section>

      {/* Resources List Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Select a Resource</h2>
        </div>

        {resources.length > 0 ? (
          <TeachResourceList
            resources={resources}
            onStartTutorSession={handleStartTutorSession}
          />
        ) : (
          <div className="bg-[#0A1122]/50 rounded-lg p-12 border border-white/10 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4">
              <GraduationCap className="w-8 h-8 text-indigo-500" />
            </div>
            <h3 className="text-xl text-gray-400 mb-4">No resources found</h3>
            <p className="text-gray-500 mb-6">Upload a resource to start learning</p>
            <Button 
              className="bg-indigo-500 hover:bg-indigo-600 text-white"
              onClick={() => {/* TODO: Implement resource upload */}}
            >
              Upload Resource
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};

export default TeachHub;
