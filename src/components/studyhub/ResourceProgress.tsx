import { FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Resource {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
}

interface ResourceProgressProps {
  resources: Resource[];
}

const ResourceProgress = ({ resources }: ResourceProgressProps) => {
  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm">
      <h2 className="text-2xl font-bold mb-6">Progress of your Study Set</h2>
      <div className="space-y-4">
        {resources.map(resource => (
          <div key={resource.id} className="flex items-center gap-4">
            <FileText className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium truncate">{resource.name}</p>
                <span className="text-sm text-muted-foreground">0 / 14</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ResourceProgress;