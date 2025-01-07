import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import PDFContent from "./pdf/PDFContent";
import PDFChat from "./pdf/PDFChat";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

interface PDFViewerProps {
  resourceId: string;
  onClose: () => void;
}

const PDFViewer = ({ resourceId, onClose }: PDFViewerProps) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const [leftPanelSize, setLeftPanelSize] = useState(70);

  useEffect(() => {
    const resources = JSON.parse(localStorage.getItem('resources') || '[]');
    const resource = resources.find((r: any) => r.id === resourceId);
    
    if (resource?.url) {
      setPdfUrl(resource.url);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load the PDF file"
      });
    }
  }, [resourceId]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-background">
      <ResizablePanelGroup 
        direction="horizontal" 
        className="flex-1 h-full"
      >
        <ResizablePanel 
          defaultSize={70}
          minSize={30}
          maxSize={80}
        >
          <div className="flex flex-col h-full">
            <Tabs defaultValue="view-pdf" className="flex-1">
              <div className="sticky top-0 z-10 bg-background border-b">
                <div className="flex items-center justify-between px-3">
                  <TabsList className="h-12">
                    <TabsTrigger value="notes" className="text-sm">Notes</TabsTrigger>
                    <TabsTrigger value="view-pdf" className="text-sm">View PDF</TabsTrigger>
                    <TabsTrigger value="transcript" className="text-sm">Transcript</TabsTrigger>
                    <TabsTrigger value="dual-view" className="text-sm">Dual View</TabsTrigger>
                  </TabsList>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <TabsContent 
                value="view-pdf" 
                className="flex-1 h-[calc(100%-3rem)] mt-0 relative"
              >
                <PDFContent pdfUrl={pdfUrl} containerWidth={leftPanelSize} />
              </TabsContent>
              <TabsContent value="notes" className="mt-0">
                Notes content here
              </TabsContent>
              <TabsContent value="transcript" className="mt-0">
                Transcript content here
              </TabsContent>
              <TabsContent value="dual-view" className="mt-0">
                Dual view content here
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel 
          defaultSize={30}
          minSize={20}
          maxSize={70}
        >
          <PDFChat />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default PDFViewer;