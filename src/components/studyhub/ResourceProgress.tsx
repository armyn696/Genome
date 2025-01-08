import { FileText, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ResourceUploader from "../ResourceUploader";

interface Resource {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
}

interface ResourceProgressProps {
  resources: Resource[];
  onResourceAdd?: (resource: Resource) => void;
}

const ResourceProgress = ({ resources, onResourceAdd }: ResourceProgressProps) => {
  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm">
      <h2 className="text-2xl font-bold mb-6">Progress of your Study Set</h2>
      {resources.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No study materials uploaded yet.</p>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 border-primary/50 hover:bg-primary/10"
              >
                <Plus className="h-5 w-5 text-primary" />
                Add Your First Resource
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] bg-background/95 backdrop-blur-sm">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-center mb-4">Add Material</DialogTitle>
              </DialogHeader>
              {onResourceAdd && <ResourceUploader onResourceAdd={onResourceAdd} />}
            </DialogContent>
          </Dialog>
        </div>
      ) : (
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
      )}
    </Card>
  );
};

export default ResourceProgress;