import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const PDFChatHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-50 w-full p-4 border-b border-white/10 bg-background">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/')}
        className="group flex items-center gap-2 hover:bg-primary/20 transition-all duration-300 rounded-xl px-4 py-2 text-white"
      >
        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
        <span className="font-medium">Back to PDF Manager</span>
      </Button>
    </div>
  );
};