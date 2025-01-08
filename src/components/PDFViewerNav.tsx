import { Button } from "@/components/ui/button";
import { ViewType } from "@/types/view";

interface PDFViewerNavProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const PDFViewerNav = ({ currentView, onViewChange }: PDFViewerNavProps) => {
  return (
    <div className="flex items-center justify-center gap-2 bg-background/80 backdrop-blur-sm border-b border-border p-2">
      <Button
        variant={currentView === "notes" ? "default" : "ghost"}
        onClick={() => onViewChange("notes")}
      >
        Notes
      </Button>
      <Button
        variant={currentView === "pdf" ? "default" : "ghost"}
        onClick={() => onViewChange("pdf")}
      >
        PDF
      </Button>
      <Button
        variant={currentView === "transcript" ? "default" : "ghost"}
        onClick={() => onViewChange("transcript")}
      >
        Transcript
      </Button>
      <Button
        variant={currentView === "dual" ? "default" : "ghost"}
        onClick={() => onViewChange("dual")}
      >
        Dual
      </Button>
    </div>
  );
};