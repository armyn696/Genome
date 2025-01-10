import { Button } from "@/components/ui/button";
import { Wand } from "lucide-react";
import { useState } from "react";

interface PDFViewerControlsProps {
  zoom: number;
  currentPage: number;
  totalPages: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onPageChange: (page: number) => void;
}

export const PDFViewerControls = ({
  zoom,
  currentPage,
  totalPages,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onPageChange,
}: PDFViewerControlsProps) => {
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  const toggleDrawingMode = () => {
    setIsDrawingMode(!isDrawingMode);
    // Add drawing mode logic here when canvas is implemented
    console.log("Drawing mode:", !isDrawingMode);
  };

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between gap-2 bg-background/80 backdrop-blur-sm border-b p-2">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onZoomOut}
          title="Zoom Out"
        >
          <span className="sr-only">Zoom Out</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs"
          onClick={onResetZoom}
        >
          {zoom}%
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onZoomIn}
          title="Zoom In"
        >
          <span className="sr-only">Zoom In</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </Button>

        <Button
          variant={isDrawingMode ? "default" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={toggleDrawingMode}
          title="Drawing Mode"
        >
          <Wand className="h-4 w-4" />
          <span className="sr-only">Drawing Mode</span>
        </Button>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          title="Previous Page"
        >
          <span className="sr-only">Previous Page</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Button>

        <span className="text-sm">
          {currentPage} / {totalPages}
        </span>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          title="Next Page"
        >
          <span className="sr-only">Next Page</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Button>
      </div>
    </div>
  );
};