import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Send, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { useToast } from "@/components/ui/use-toast";

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  resourceId: string;
  onClose: () => void;
}

const PDFViewer = ({ resourceId, onClose }: PDFViewerProps) => {
  const [message, setMessage] = useState("");
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { toast } = useToast();
  
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

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    console.log("PDF loaded successfully with", numPages, "pages");
    setNumPages(numPages);
    toast({
      title: "PDF loaded successfully",
      description: `Document has ${numPages} pages`
    });
  }

  function onDocumentLoadError(error: Error) {
    console.error("Error loading PDF:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to load the PDF file"
    });
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex rounded-lg border bg-background/50 backdrop-blur-sm mt-4 mb-8 overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <Tabs defaultValue="view-pdf" className="flex-1 flex flex-col">
          <div className="border-b flex items-center justify-between px-4 bg-muted/50">
            <TabsList className="w-full justify-start h-14 bg-transparent">
              <TabsTrigger 
                value="notes" 
                className="data-[state=active]:bg-primary/90 data-[state=active]:text-primary-foreground rounded-md transition-all duration-200 hover:bg-accent/80"
              >
                Notes
              </TabsTrigger>
              <TabsTrigger 
                value="view-pdf"
                className="data-[state=active]:bg-primary/90 data-[state=active]:text-primary-foreground rounded-md transition-all duration-200 hover:bg-accent/80"
              >
                View PDF
              </TabsTrigger>
              <TabsTrigger 
                value="transcript"
                className="data-[state=active]:bg-primary/90 data-[state=active]:text-primary-foreground rounded-md transition-all duration-200 hover:bg-accent/80"
              >
                Transcript
              </TabsTrigger>
              <TabsTrigger 
                value="dual-view"
                className="data-[state=active]:bg-primary/90 data-[state=active]:text-primary-foreground rounded-md transition-all duration-200 hover:bg-accent/80"
              >
                Dual View
              </TabsTrigger>
            </TabsList>
            <Button variant="ghost" size="icon" onClick={onClose} className="ml-2">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <TabsContent value="view-pdf" className="flex-1 p-4">
            <ScrollArea className="h-full w-full rounded-md border">
              <div className="p-4 space-y-4">
                {pdfUrl ? (
                  <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    className="flex flex-col items-center"
                  >
                    {Array.from(new Array(numPages || 0), (el, index) => (
                      <div key={`page_${index + 1}`} className="mb-4">
                        <Page
                          pageNumber={index + 1}
                          width={800}
                          className="shadow-lg rounded-lg overflow-hidden"
                        />
                      </div>
                    ))}
                  </Document>
                ) : (
                  <div className="text-center text-muted-foreground">
                    Loading PDF...
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="notes">Notes content here</TabsContent>
          <TabsContent value="transcript">Transcript content here</TabsContent>
          <TabsContent value="dual-view">Dual view content here</TabsContent>
        </Tabs>
      </div>

      {/* Chat Sidebar */}
      <div className="w-80 border-l flex flex-col bg-sidebar">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Chat with AI about this PDF</h2>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {/* Chat messages will go here */}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <form 
            className="flex gap-2" 
            onSubmit={(e) => {
              e.preventDefault();
              console.log("Sending message:", message);
              setMessage("");
            }}
          >
            <Input
              placeholder="Ask anything about this PDF..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
