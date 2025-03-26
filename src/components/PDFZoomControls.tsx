import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ZoomIn, ZoomOut, RotateCw, Wand2, Camera } from "lucide-react";

interface PDFZoomControlsProps {
  zoom: number;
  currentPage: number;
  totalPages: number;
  inputPage: string;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onPageInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPageChange: (page: number) => void;
  drawingMode: boolean;
  onToggleDrawing: () => void;
  screenshotMode: boolean;
  onToggleScreenshot: () => void;
  onScreenshot: () => void;
}

export const PDFZoomControls: React.FC<PDFZoomControlsProps> = ({
  zoom,
  currentPage,
  totalPages,
  inputPage,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onPageInputChange,
  onPageChange,
  drawingMode,
  onToggleDrawing,
  screenshotMode,
  onToggleScreenshot,
  onScreenshot,
}) => {
  return (
    <div className="pt-4 p-2 border-b flex items-center justify-between bg-background/95 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onResetZoom}>
          <RotateCw className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted">
          {zoom}%
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleDrawing}
          className={drawingMode ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}
        >
          <Wand2 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            if (screenshotMode) {
              onScreenshot();
            } else {
              onToggleScreenshot();
            }
          }}
          className={screenshotMode ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}
        >
          <Camera className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ‹
        </Button>
        <div className="flex items-center gap-1">
          <Input
            type="text"
            value={inputPage}
            onChange={onPageInputChange}
            className="w-12 text-center p-1"
            placeholder={currentPage.toString()}
          />
          <span className="text-sm text-muted-foreground">/ {totalPages}</span>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          ›
        </Button>
      </div>
    </div>
  );
};
