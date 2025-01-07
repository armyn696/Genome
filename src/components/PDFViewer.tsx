import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Send, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PDFViewerProps {
  resourceId: string;
  onClose: () => void;
}

const PDFViewer = ({ resourceId, onClose }: PDFViewerProps) => {
  const [message, setMessage] = useState("");
  
  console.log("Rendering PDFViewer for resource:", resourceId);

  return (
    <div className="h-[calc(100vh-6rem)] flex rounded-lg border bg-background/50 backdrop-blur-sm">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <Tabs defaultValue="view-pdf" className="flex-1 flex flex-col">
          <div className="border-b flex items-center justify-between px-4">
            <TabsList className="w-full justify-start h-12">
              <TabsTrigger value="notes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Notes</TabsTrigger>
              <TabsTrigger value="view-pdf" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">View PDF</TabsTrigger>
              <TabsTrigger value="transcript" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Transcript</TabsTrigger>
              <TabsTrigger value="dual-view" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Dual View</TabsTrigger>
            </TabsList>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <TabsContent value="view-pdf" className="flex-1 p-4">
            <ScrollArea className="h-full w-full rounded-md border">
              {/* This is where we'll render the PDF pages */}
              <div className="p-4 space-y-4">
                <div className="aspect-[8.5/11] bg-white rounded-lg shadow-lg">
                  {/* PDF Page Content */}
                </div>
                {/* Add more pages as needed */}
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