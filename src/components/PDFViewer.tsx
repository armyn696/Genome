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

  const handlePanelResize = (sizes: number[]) => {
    setLeftPanelSize(sizes[0]);
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col rounded-lg border bg-background/50 backdrop-blur-sm mt-4 mb-8">
      <ResizablePanelGroup 
        direction="horizontal" 
        className="flex-1 w-full rounded-lg"
        onLayout={handlePanelResize}
      >
        <ResizablePanel 
          defaultSize={70}
          minSize={30}
          maxSize={85}
          className="focus-visible:outline-none focus-visible:ring-0"
        >
          <div className="flex flex-col h-full">
            <Tabs defaultValue="view-pdf" className="flex-1 flex flex-col h-full">
              <div className="border-b flex items-center justify-between px-4 bg-muted/50">
                <TabsList className="w-full justify-start h-14 bg-transparent">
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="view-pdf">View PDF</TabsTrigger>
                  <TabsTrigger value="transcript">Transcript</TabsTrigger>
                  <TabsTrigger value="dual-view">Dual View</TabsTrigger>
                </TabsList>
                <Button variant="ghost" size="icon" onClick={onClose} className="ml-2">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <TabsContent value="view-pdf" className="flex-1 h-full">
                <PDFContent pdfUrl={pdfUrl} containerWidth={leftPanelSize} />
              </TabsContent>
              <TabsContent value="notes">Notes content here</TabsContent>
              <TabsContent value="transcript">Transcript content here</TabsContent>
              <TabsContent value="dual-view">Dual view content here</TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>

        <ResizableHandle 
          withHandle 
          className="bg-border hover:bg-primary/20 transition-colors"
        />

        <ResizablePanel 
          defaultSize={30}
          minSize={15}
          maxSize={70}
          className="focus-visible:outline-none focus-visible:ring-0"
        >
          <PDFChat />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default PDFViewer;