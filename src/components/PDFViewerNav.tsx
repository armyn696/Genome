import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, MessageSquare, BookOpen, LayoutPanelLeft, BookOpenCheck, ClipboardList, LayoutGrid, ScrollText, Columns, Download } from "lucide-react";

interface PDFViewerNavProps {
  currentView: 'chat' | 'notes' | 'pdf' | 'transcript' | 'jozveh' | 'dual' | 'quiz' | 'flashcards' | 'mindmap' | 'matchgame';
  onViewChange: (view: 'chat' | 'notes' | 'pdf' | 'transcript' | 'jozveh' | 'dual' | 'quiz' | 'flashcards' | 'mindmap' | 'matchgame') => void;
  onDownload?: () => void;
}

export const PDFViewerNav = ({ currentView, onViewChange, onDownload }: PDFViewerNavProps) => {
  return (
    <div className="flex justify-center space-x-2 p-2 bg-background/95 backdrop-blur-sm border-b">
      <Button
        variant={currentView === 'notes' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('notes')}
        className="gap-2"
      >
        <MessageSquare className="h-4 w-4" />
        Notes
      </Button>
      <Button
        variant={currentView === 'pdf' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('pdf')}
        className="gap-2"
      >
        <FileText className="h-4 w-4" />
        View PDF
      </Button>
      <Button
        variant={currentView === 'transcript' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('transcript')}
        className="gap-2"
      >
        <BookOpen className="h-4 w-4" />
        Transcript
      </Button>
      <Button
        variant={currentView === 'jozveh' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('jozveh')}
        className="gap-2"
      >
        <ClipboardList className="h-4 w-4" />
        Jozveh
      </Button>
      <Button
        variant={currentView === 'dual' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('dual')}
        className="gap-2"
      >
        <LayoutPanelLeft className="h-4 w-4" />
        Dual View
      </Button>
      {onDownload && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDownload}
          className="flex gap-1.5 items-center"
        >
          <Download className="h-4 w-4" />
          <span>Download</span>
        </Button>
      )}
    </div>
  );
};