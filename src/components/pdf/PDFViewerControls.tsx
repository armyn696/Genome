import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, RotateCcw, Wand2 } from "lucide-react";

interface PDFViewerControlsProps {
  zoom: number;
  currentPage: number;
  totalPages: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onPageChange: (page: number) => void;
  isDrawingMode?: boolean;
  onToggleDrawing?: () => void;
}

export const PDFViewerControls = ({
  zoom,
  currentPage,
  totalPages,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onPageChange,
  isDrawingMode,
  onToggleDrawing
}: PDFViewerControlsProps) => {
  return (
    <div className="flex items-center justify-between p-2 border-b">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onZoomOut}
          className="hover:bg-accent"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-16 text-center">{zoom}%</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onZoomIn}
          className="hover:bg-accent"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onResetZoom}
          className="hover:bg-accent"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        {onToggleDrawing && (
          <Button
            variant={isDrawingMode ? "secondary" : "ghost"}
            size="icon"
            onClick={onToggleDrawing}
            className="hover:bg-accent"
          >
            <Wand2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={1}
          max={totalPages}
          value={currentPage}
          onChange={(e) => onPageChange(Number(e.target.value))}
          className="w-16 text-center"
        />
        <span>of {totalPages}</span>
      </div>
    </div>
  );
};