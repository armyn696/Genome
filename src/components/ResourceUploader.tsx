import { useState } from "react";
import { Upload, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

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

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB limit
const MAX_STORAGE_SIZE = 150 * 1024 * 1024; // 150MB total storage limit

const ResourceUploader = ({ onResourceAdd }: ResourceUploaderProps) => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);

  const clearAllStorage = () => {
    const keys = Object.keys(localStorage);
    const pdfKeys = keys.filter(key => key.startsWith('pdf_'));
    pdfKeys.forEach(key => localStorage.removeItem(key));
    toast({
      title: "Storage cleared",
      description: "All stored PDFs have been removed"
    });
  };

  const getTotalStorageUsed = () => {
    let total = 0;
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      total += localStorage[key].length;
    });
    return total;
  };

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

    if (file.size > MAX_FILE_SIZE) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload a PDF file smaller than 50MB"
      });
      return;
    }

    const size = file.size < 1024 * 1024 
      ? `${(file.size / 1024).toFixed(2)} KB`
      : `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

    const id = Date.now().toString();
    
    try {
      // Check total storage before proceeding
      const currentStorage = getTotalStorageUsed();
      if (currentStorage + file.size * 1.37 > MAX_STORAGE_SIZE) { // 1.37 factor for base64 overhead
        toast({
          variant: "destructive",
          title: "Storage full",
          description: "Please clear some storage before uploading new files",
          action: (
            <Button variant="outline" size="sm" onClick={clearAllStorage}>
              Clear All
            </Button>
          ),
        });
        return;
      }

      // Create a data URL from the file
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
      });

      try {
        // Clear some storage if needed
        const keys = Object.keys(localStorage);
        const pdfKeys = keys.filter(key => key.startsWith('pdf_'));
        if (pdfKeys.length > 2) { // Keep only last 2 PDFs to save storage space
          pdfKeys
            .sort((a, b) => parseInt(a.split('_')[1]) - parseInt(b.split('_')[1]))
            .slice(0, pdfKeys.length - 2)
            .forEach(key => localStorage.removeItem(key));
        }

        localStorage.setItem(`pdf_${id}`, dataUrl);
      } catch (storageError) {
        console.error("Storage error:", storageError);
        toast({
          variant: "destructive",
          title: "Storage error",
          description: "Storage is full. Please clear some PDFs first",
          action: (
            <Button variant="outline" size="sm" onClick={clearAllStorage}>
              Clear All
            </Button>
          ),
        });
        return;
      }

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
    } catch (error) {
      console.error("File reading error:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again with a smaller file or clear some storage.",
        action: (
          <Button variant="outline" size="sm" onClick={clearAllStorage}>
            Clear All
          </Button>
        ),
      });
    }
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
            <span className="text-sm text-muted-foreground">Drag and drop or click to upload (max 50MB)</span>
          </div>
        </label>
      </div>

      <Button 
        variant="outline" 
        className="w-full flex items-center gap-2" 
        onClick={clearAllStorage}
      >
        <Trash2 className="h-4 w-4" />
        Clear All PDFs
      </Button>
    </div>
  );
};

export default ResourceUploader;