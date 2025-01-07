import { useState } from "react";
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Resource {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  url?: string;
}

interface ResourceUploaderProps {
  onResourceAdded: (resource: Resource) => void;
}

const ResourceUploader = ({ onResourceAdded }: ResourceUploaderProps) => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = async (file: File) => {
    console.log("Handling file upload:", file.name);
    
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a PDF file"
      });
      return;
    }

    try {
      // Create a blob URL for the file
      const fileUrl = URL.createObjectURL(file);
      
      const size = file.size < 1024 * 1024 
        ? `${(file.size / 1024).toFixed(2)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

      const newResource: Resource = {
        id: Date.now().toString(),
        name: file.name,
        type: 'PDF',
        size: size,
        uploadDate: new Date().toLocaleDateString(),
        url: fileUrl
      };

      // Store resources in localStorage
      const existingResources = JSON.parse(localStorage.getItem('resources') || '[]');
      const updatedResources = [...existingResources, newResource];
      localStorage.setItem('resources', JSON.stringify(updatedResources));

      onResourceAdded(newResource);
      console.log("Resource added:", newResource);
      
      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been added to your resources`
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was an error uploading your file"
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  return (
    <div className="space-y-6">
      <input
        type="file"
        id="pdf-upload"
        accept=".pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={handleDrop}
        className="w-full"
      >
        <label 
          htmlFor="pdf-upload"
          className="block w-full cursor-pointer"
        >
          <div className={`w-full h-32 flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg
            ${isDragging ? 'border-primary bg-primary/5' : 'hover:border-primary hover:bg-primary/5'}`}
          >
            <Upload className="h-8 w-8 text-primary" />
            <span className="font-medium">Upload PDF</span>
            <span className="text-sm text-muted-foreground">Drag and drop or click to upload</span>
          </div>
        </label>
      </div>

      <DialogClose asChild>
        <Button variant="outline" className="w-full">
          Done
        </Button>
      </DialogClose>
    </div>
  );
};

export default ResourceUploader;