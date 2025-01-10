import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ZoomIn, ZoomOut, RotateCw } from "lucide-react";

interface PDFViewerControlsProps {
  zoom: number;
  currentPage: number;
  totalPages: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onPageChange: (page: number) => void;
}

export const PDFViewerControls: React.FC<PDFViewerControlsProps> = ({
  zoom,
  currentPage,
  totalPages,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onPageChange,
}) => {
  return (
    <div className="flex items-center justify-between p-2 bg-background border-b z-50 relative shadow-md">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="icon"
          onClick={onZoomOut}
          className="h-8 w-8"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          onClick={onResetZoom}
          className="h-8 w-8"
        >
          <RotateCw className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          onClick={onZoomIn}
          className="h-8 w-8"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">{zoom}%</span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8"
        >
          ‹
        </Button>
        <div className="flex items-center gap-1">
          <Input
            type="text"
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value);
              if (!isNaN(page) && page >= 1 && page <= totalPages) {
                onPageChange(page);
              }
            }}
            className="w-12 h-8 text-center p-1"
          />
          <span className="text-sm text-muted-foreground">/ {totalPages}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-8"
        >
          ›
        </Button>
      </div>
    </div>
  );
};