import { Button } from "@/components/ui/button";
import { Pencil, Wand2, Camera } from "lucide-react";

interface PDFViewerControlsProps {
  zoom: number;
  currentPage: number;
  totalPages: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onPageChange: (page: number) => void;
  drawingMode: boolean;
  onToggleDrawing: () => void;
  onScreenshot: () => void;
}

export const PDFViewerControls = ({
  zoom,
  currentPage,
  totalPages,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onPageChange,
  drawingMode,
  onToggleDrawing,
  onScreenshot
}: PDFViewerControlsProps) => {
  return (
    <div className="absolute bottom-4 right-4 z-50 flex flex-col gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={onToggleDrawing}
        className={drawingMode ? 'bg-primary text-primary-foreground' : ''}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <Wand2 className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onScreenshot}
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <Camera className="h-4 w-4" />
      </Button>
    </div>
  );
};