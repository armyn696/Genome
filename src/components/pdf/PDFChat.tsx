import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

const PDFChat = () => {
  const [message, setMessage] = useState("");

  return (
    <div className="h-full flex flex-col bg-sidebar">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Chat with AI about this PDF</h2>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Chat messages will go here */}
        </div>
      </ScrollArea>

      <div className="p-4 border-t mt-auto">
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
  );
};

export default PDFChat;