import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Resource {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
}

interface ResourceListProps {
  resources: Resource[];
}

const ResourceList = ({ resources }: ResourceListProps) => {
  const navigate = useNavigate();
  
  if (resources.length === 0) return null;

  return (
    <div className="space-y-2">
      {resources.map(resource => (
        <div
          key={resource.id}
          className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
          onClick={() => navigate(`/pdf-viewer/${resource.id}`)}
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
  );
};

export default ResourceList;