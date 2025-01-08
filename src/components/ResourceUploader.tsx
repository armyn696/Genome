import { useState } from "react";
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Resource {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
}

interface ResourceUploaderProps {
  onResourceAdd: (resource: Resource) => void;
}

const ResourceUploader = ({ onResourceAdd }: ResourceUploaderProps) => {
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

    const size = file.size < 1024 * 1024 
      ? `${(file.size / 1024).toFixed(2)} KB`
      : `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

    const id = Date.now().toString();
    
    // Create a data URL from the file
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      // Store the PDF data URL
      localStorage.setItem(`pdf_${id}`, dataUrl);
    };
    reader.readAsDataURL(file);

    const newResource: Resource = {
      id,
      name: file.name,
      type: 'PDF',
      size,
      uploadDate: new Date().toLocaleDateString()
    };

    onResourceAdd(newResource);
    console.log("Resource added:", newResource);
    
    toast({
      title: "File uploaded successfully",
      description: `${file.name} has been added to your resources`
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
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
      <input
        type="file"
        id="pdf-upload"
        accept=".pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFileUpload(file);
          }
        }}
      />

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
    </div>
  );
};

export default ResourceUploader;