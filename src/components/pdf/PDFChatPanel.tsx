import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { useEffect, useRef } from "react";

interface Message {
  text: string;
  sender

Let me help you implement these PDF viewer components in your application. I'll integrate them while maintaining the existing functionality.

<lov-code>
Let's update the necessary files to implement the PDF viewer functionality:

<lov-write file_path="src/components/PDFViewer.tsx">
import React, { useRef, useState } from 'react';
import { PDFViewerPanel } from './pdf/PDFViewerPanel';
import { PDFZoomControls } from './pdf/PDFZoomControls';
import { Button } from "@/components/ui/button";
import { Pencil, Eraser } from "lucide-react";

interface PDFViewerProps {
  resourceId: string;
}

export const PDFViewer = ({ resourceId }: PDFViewerProps) => {
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [inputPage, setInputPage] = useState('1');
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [currentTool, setCurrentTool] = useState<'pencil' | 'eraser'>('pencil');
  const pageRefs = useRef<HTMLDivElement[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
  const handleResetZoom = () => setZoom(100);

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setInputPage(value);
      const pageNum = parseInt(value);
      if (pageNum > 0 && pageNum <= pageRefs.current.length) {
        setCurrentPage(pageNum);
      }
    }
  };

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= pageRefs.current.length) {
      setCurrentPage(page);
      setInputPage(page.toString());
    }
  };

  const toggleDrawingMode = () => {
    setIsDrawingMode(!isDrawingMode);
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'toggleDrawing', enabled: !isDrawingMode },
        '*'
      );
    }
  };

  const clearDrawing = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'clearDrawing' },
        '*'
      );
    }
  };

  const switchTool = (tool: 'pencil' | 'eraser') => {
    setCurrentTool(tool);
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'switchTool', tool },
        '*'
      );
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 bg-background/95 backdrop-blur-sm border-b">
        <PDFZoomControls
          zoom={zoom}
          currentPage={currentPage}
          totalPages={pageRefs.current.length}
          inputPage={inputPage}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
          onPageInputChange={handlePageInputChange}
          onPageChange={handlePageChange}
        />
        <div className="flex items-center gap-2">
          <Button
            variant={isDrawingMode ? "default" : "outline"}
            size="sm"
            onClick={toggleDrawingMode}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Draw
          </Button>
          {isDrawingMode && (
            <>
              <Button
                variant={currentTool === 'pencil' ? "default" : "outline"}
                size="sm"
                onClick={() => switchTool('pencil')}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant={currentTool === 'eraser' ? "default" : "outline"}
                size="sm"
                onClick={() => switchTool('eraser')}
              >
                <Eraser className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearDrawing}
              >
                Clear
              </Button>
            </>
          )}
        </div>
      </div>
      <PDFViewerPanel
        ref={iframeRef}
        pageRefs={pageRefs}
        zoom={zoom}
        currentPage={currentPage}
      />
    </div>
  );
};