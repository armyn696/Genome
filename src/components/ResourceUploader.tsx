import { useState } from "react";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { storePdf } from "@/utils/pdfStorage";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Resource } from "@/types";

interface ResourceUploaderProps {
  onResourceAdd: (resource: Resource) => void;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB limit

const ResourceUploader = ({ onResourceAdd }: ResourceUploaderProps) => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const handleFileUpload = async (file: File) => {
    console.log("Handling file upload:", file.name);
    
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      toast({
        variant: "destructive",
        title: "نوع فایل نامعتبر",
        description: "لطفا یک فایل PDF آپلود کنید"
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        variant: "destructive",
        title: "حجم فایل زیاد است",
        description: "لطفا یک فایل PDF کمتر از 50 مگابایت آپلود کنید"
      });
      return;
    }

    try {
      setShowDialog(true);
      const { id: resourceId, url } = await storePdf(file);
      
      const resource: Resource = {
        id: resourceId,
        name: file.name,
        type: 'pdf',
        size: file.size < 1024 * 1024 
          ? `${(file.size / 1024).toFixed(2)} KB`
          : `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        uploadDate: new Date().toLocaleDateString(),
        url,
        storageName: file.name
      };

      onResourceAdd(resource);
      
      toast({
        title: "موفقیت",
        description: "فایل با موفقیت آپلود شد"
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        variant: "destructive",
        title: "خطا",
        description: "خطا در آپلود فایل. لطفا دوباره تلاش کنید."
      });
    } finally {
      setShowDialog(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  return (
    <>
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <input
          id="fileInput"
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileInputChange}
        />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-semibold">Upload a PDF</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Drag and drop or click to upload
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Maximum file size: 50MB
        </p>
      </div>

      <Dialog open={showDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogTitle>Uploading PDF</DialogTitle>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Please wait while we upload your PDF file. This may take a moment...
            </p>
            <div className="flex items-center justify-center p-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ResourceUploader;