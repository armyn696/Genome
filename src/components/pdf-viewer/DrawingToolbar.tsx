import React from 'react';
import { Button } from "@/components/ui/button";
import { Paintbrush, Eraser, Undo, Redo, Save } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DrawingToolbarProps {
  onColorChange: (color: string) => void;
  onBrushSizeChange: (size: number) => void;
  onToolChange: (tool: 'brush' | 'eraser') => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  currentTool: 'brush' | 'eraser';
  currentColor: string;
  currentSize: number;
}

const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00'];
const sizes = [2, 4, 6, 8, 10];

export const DrawingToolbar = ({
  onColorChange,
  onBrushSizeChange,
  onToolChange,
  onUndo,
  onRedo,
  onSave,
  currentTool,
  currentColor,
  currentSize,
}: DrawingToolbarProps) => {
  return (
    <TooltipProvider>
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2 rounded-lg shadow-lg border border-border flex items-center gap-2">
        <div className="flex items-center gap-2 border-r border-border pr-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={currentTool === 'brush' ? 'default' : 'outline'}
                size="icon"
                onClick={() => onToolChange('brush')}
              >
                <Paintbrush className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Brush Tool (B)</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={currentTool === 'eraser' ? 'default' : 'outline'}
                size="icon"
                onClick={() => onToolChange('eraser')}
              >
                <Eraser className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Eraser Tool (E)</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center gap-2 border-r border-border pr-2">
          {colors.map((color) => (
            <button
              key={color}
              className={`w-6 h-6 rounded-full ${
                currentColor === color ? 'ring-2 ring-primary' : ''
              }`}
              style={{ backgroundColor: color }}
              onClick={() => onColorChange(color)}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 border-r border-border pr-2">
          {sizes.map((size) => (
            <button
              key={size}
              className={`w-6 h-6 rounded flex items-center justify-center ${
                currentSize === size ? 'bg-primary/20' : ''
              }`}
              onClick={() => onBrushSizeChange(size)}
            >
              <div
                className="rounded-full bg-foreground"
                style={{
                  width: size,
                  height: size,
                }}
              />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={onUndo}>
                <Undo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Undo (Ctrl+Z)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={onRedo}>
                <Redo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Redo (Ctrl+Y)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={onSave}>
                <Save className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Save Drawings (Ctrl+S)</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};