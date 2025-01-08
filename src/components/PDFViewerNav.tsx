import { Button } from "@/components/ui/button";
import { FileText, MessageSquare, BookOpen, LayoutPanelLeft } from "lucide-react";

interface PDFViewerNavProps {
  currentView: 'notes' | 'pdf' | 'transcript' | 'dual';
  onViewChange: (view: 'notes' | 'pdf' | 'transcript' | 'dual') => void;
}

export const PDFViewerNav = ({ currentView, onViewChange }: PDFViewerNavProps) => {
  return (
    <div className="flex space-x-2 bg-background/80 backdrop-blur-sm p-1.5 rounded-lg">
      <Button
        variant={currentView === 'notes' ? 'default' : 'ghost'}
        onClick={() => onViewChange('notes')}
        className="gap-2"
        size="sm"
      >
        <MessageSquare className="h-4 w-4" />
        Notes
      </Button>
      <Button
        variant={currentView === 'pdf' ? 'default' : 'ghost'}
        onClick={() => onViewChange('pdf')}
        className="gap-2"
        size="sm"
      >
        <FileText className="h-4 w-4" />
        View PDF
      </Button>
      <Button
        variant={currentView === 'transcript' ? 'default' : 'ghost'}
        onClick={() => onViewChange('transcript')}
        className="gap-2"
        size="sm"
      >
        <BookOpen className="h-4 w-4" />
        Transcript
      </Button>
      <Button
        variant={currentView === 'dual' ? 'default' : 'ghost'}
        onClick={() => onViewChange('dual')}
        className="gap-2"
        size="sm"
      >
        <LayoutPanelLeft className="h-4 w-4" />
        Dual View
      </Button>
    </div>
  );
};