import { useState } from "react";
import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface Resource {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
}

const ResourceUploader = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (file: File) => {
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a PDF file"
      });
      return;
    }

    const size = file.size < 1024 * 1024 
      ? `${(file.size / 1024).toFixed(2)} KB`
      : `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

    const newResource: Resource = {
      id: Date.now().toString(),
      name: file.name,
      type: 'PDF',
      size: size,
      uploadDate: new Date().toLocaleDateString()
    };

    setResources(prev => [...prev, newResource]);
    
    toast({
      title: "File uploaded successfully",
      description: `${file.name} has been added to your resources`
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden file input */}
      <input
        type="file"
        id="pdf-upload"
        accept=".pdf"
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Upload button */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="w-full"
      >
        <label 
          htmlFor="pdf-upload"
          className="block w-full cursor-pointer"
        >
          <div
            className={`w-full h-32 flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg
              ${isDragging ? 'border-primary bg-primary/5' : 'hover:border-primary hover:bg-primary/5'}`}
          >
            <Upload className="h-8 w-8 text-primary" />
            <span className="font-medium">Upload PDF</span>
            <span className="text-sm text-muted-foreground">Drag and drop or click to upload</span>
          </div>
        </label>
      </div>

      {/* Resources list */}
      {resources.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Your Resources</h3>
          <div className="space-y-2">
            {resources.map(resource => (
              <div
                key={resource.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
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
      )}
    </div>
  );
};

export default ResourceUploader;