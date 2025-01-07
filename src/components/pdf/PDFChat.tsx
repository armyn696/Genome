import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

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
            // Handle message submission
            setMessage("");
          }}
        >
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit">Send</Button>
        </form>
      </div>
    </div>
  );
};

export default PDFChat;