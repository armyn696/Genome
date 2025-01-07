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
  
  console.log("Rendering PDFViewer for resource:", resourceId);

  useEffect(() => {
    const resources = JSON.parse(localStorage.getItem('resources') || '[]');
    const resource = resources.find((r: any) => r.id === resourceId);
    
    if (resource?.url) {
      console.log("Setting PDF URL:", resource.url);
      setPdfUrl(resource.url);
    } else {
      console.log("No URL found for resource:", resourceId);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load the PDF file"
      });
    }
  }, [resourceId]);

  return (
    <div className="h-[calc(100vh-12rem)] flex rounded-lg border bg-background/50 backdrop-blur-sm mt-4 mb-8 overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="w-full min-h-[600px]">
        <ResizablePanel 
          defaultSize={70} 
          minSize={30} 
          maxSize={80}
          onResize={setLeftPanelSize}
        >
          <div className="flex flex-col h-full">
            <Tabs defaultValue="view-pdf" className="flex-1 flex flex-col h-full">
              <div className="border-b flex items-center justify-between px-4 bg-muted/50">
                <TabsList className="w-full justify-start h-14 bg-transparent">
                  <TabsTrigger value="notes" className="data-[state=active]:bg-primary/90 data-[state=active]:text-primary-foreground rounded-md transition-all duration-200 hover:bg-accent/80">
                    Notes
                  </TabsTrigger>
                  <TabsTrigger value="view-pdf" className="data-[state=active]:bg-primary/90 data-[state=active]:text-primary-foreground rounded-md transition-all duration-200 hover:bg-accent/80">
                    View PDF
                  </TabsTrigger>
                  <TabsTrigger value="transcript" className="data-[state=active]:bg-primary/90 data-[state=active]:text-primary-foreground rounded-md transition-all duration-200 hover:bg-accent/80">
                    Transcript
                  </TabsTrigger>
                  <TabsTrigger value="dual-view" className="data-[state=active]:bg-primary/90 data-[state=active]:text-primary-foreground rounded-md transition-all duration-200 hover:bg-accent/80">
                    Dual View
                  </TabsTrigger>
                </TabsList>
                <Button variant="ghost" size="icon" onClick={onClose} className="ml-2">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <TabsContent value="view-pdf" className="flex-1 h-full">
                <PDFContent pdfUrl={pdfUrl} />
              </TabsContent>

              <TabsContent value="notes">Notes content here</TabsContent>
              <TabsContent value="transcript">Transcript content here</TabsContent>
              <TabsContent value="dual-view">Dual view content here</TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={30} minSize={20} maxSize={70}>
          <PDFChat />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default PDFViewer;