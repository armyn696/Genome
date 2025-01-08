import { FileText } from "lucide-react";

interface Resource {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
}

interface ResourceListProps {
  resources: Resource[];
  onResourceSelect: (resource: Resource) => void;
}

const ResourceList = ({ resources, onResourceSelect }: ResourceListProps) => {
  if (resources.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Your Resources</h3>
      <div className="space-y-2">
        {resources.map(resource => (
          <div
            key={resource.id}
            className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={() => onResourceSelect(resource)}
          >
            <FileText className="h-5 w-5 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{resource.name}</p>
              <p className="text-sm text-muted-foreground">
                {resource.type} • {resource.size} • {resource.uploadDate}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceList;