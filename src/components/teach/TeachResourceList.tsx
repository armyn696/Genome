import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Resource } from "@/types";

interface TeachResourceListProps {
  resources: Resource[];
  onStartTutorSession: (resource: Resource) => void;
}

const TeachResourceList = ({ resources, onStartTutorSession }: TeachResourceListProps) => {
  return (
    <div className="space-y-4">
      {resources.map((resource) => (
        <div
          key={resource.id}
          className="bg-[#0A1122]/50 rounded-lg p-6 border border-white/10 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">{resource.name}</h3>
              <p className="text-sm text-gray-400">
                {new Date(resource.uploadDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Button
            className="bg-indigo-500 hover:bg-indigo-600 text-white"
            onClick={() => onStartTutorSession(resource)}
          >
            Start Tutor Session
          </Button>
        </div>
      ))}
    </div>
  );
};

export default TeachResourceList;
