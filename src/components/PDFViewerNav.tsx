import { Button } from "@/components/ui/button";
import { Wand } from "lucide-react";

interface PDFViewerNavProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export const PDFViewerNav = ({ currentView, onViewChange }: PDFViewerNavProps) => {
  return (
    <div className="flex items-center justify-between px-4 h-14 bg-black border-b border-border">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className={`text-white hover:text-white ${
            currentView === "draw" ? "bg-sidebar-accent text-white" : ""
          }`}
          onClick={() => onViewChange("draw")}
        >
          <Wand className="h-4 w-4 mr-2" />
          Draw
        </Button>
      </div>
    </div>
  );
};