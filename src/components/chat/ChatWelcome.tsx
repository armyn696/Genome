import { Button } from "@/components/ui/button";
import { Lightbulb, FileText, Highlighter } from "lucide-react";

interface ChatWelcomeProps {
  onSuggestionClick: (suggestion: string) => void;
}

export const ChatWelcome = ({ onSuggestionClick }: ChatWelcomeProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6 text-center px-3">
      <h1 className="text-xl md:text-2xl font-bold">AI Study Assistant</h1>
      <p className="text-xs md:text-sm text-muted-foreground max-w-md">
        I'm your personal study assistant. Ask me anything about your study materials!
      </p>
      
      <div className="w-full max-w-md space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-left">
            <FileText className="h-4 w-4 text-primary" />
            <span>ترنسکریپت (Transcript)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="justify-start text-left text-xs h-auto py-2" 
              onClick={() => onSuggestionClick("transcript")}
            >
              اطلاعات ترنسکریپت
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="justify-start text-left text-xs h-auto py-2" 
              onClick={() => onSuggestionClick("transcript صفحه 1")}
            >
              ترنسکریپت صفحه ۱
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-left">
            <Highlighter className="h-4 w-4 text-yellow-400" />
            <span>هایلایت متن</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="justify-start text-left text-xs h-auto py-2" 
              onClick={() => onSuggestionClick("نکات مهم صفحه 1 را هایلایت کن")}
            >
              هایلایت نکات مهم
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="justify-start text-left text-xs h-auto py-2" 
              onClick={() => onSuggestionClick("کلمات کلیدی صفحه 2 را هایلایت کن")}
            >
              هایلایت کلمات کلیدی
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-left">
            <Lightbulb className="h-4 w-4 text-primary" />
            <span>پیشنهادهای سوال</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="justify-start text-left text-xs h-auto py-2" 
              onClick={() => onSuggestionClick("یک خلاصه از محتوای این PDF به من بده")}
            >
              خلاصه محتوای PDF
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="justify-start text-left text-xs h-auto py-2" 
              onClick={() => onSuggestionClick("مهمترین نکات این PDF چیست؟")}
            >
              نکات کلیدی
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};