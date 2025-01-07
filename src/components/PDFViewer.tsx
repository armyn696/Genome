import { useState } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";

const PDFViewer = () => {
  const { id } = useParams();
  const [message, setMessage] = useState("");
  
  console.log("Rendering PDFViewer for resource:", id);

  return (
    <div className="h-screen flex">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <Tabs defaultValue="view-pdf" className="flex-1 flex flex-col">
          <div className="border-b">
            <TabsList className="w-full justify-start h-12">
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="view-pdf">View PDF</TabsTrigger>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="dual-view">Dual View</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="view-pdf" className="flex-1 p-4">
            <ScrollArea className="h-[calc(100vh-8rem)] w-full rounded-md border">
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