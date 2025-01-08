import { PDFViewer } from "@/components/PDFViewer";

interface PDFContentProps {
  currentView: 'chat' | 'notes' | 'pdf' | 'transcript' | 'dual' | 'quiz' | 'flashcards' | 'mindmap';
  resourceId: string;
}

export const PDFContent = ({ currentView, resourceId }: PDFContentProps) => {
  switch (currentView) {
    case 'chat':
      return (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          Chat view coming soon...
        </div>
      );
    case 'notes':
      return (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          Notes view coming soon...
        </div>
      );
    case 'pdf':
      return <PDFViewer resourceId={resourceId} />;
    case 'transcript':
      return (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          Transcript view coming soon...
        </div>
      );
    case 'dual':
      return (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          Dual view coming soon...
        </div>
      );
    case 'quiz':
      return (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          Quiz view coming soon...
        </div>
      );
    case 'flashcards':
      return (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          Flashcards view coming soon...
        </div>
      );
    case 'mindmap':
      return (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          Mindmap view coming soon...
        </div>
      );
    default:
      return <PDFViewer resourceId={resourceId} />;
  }
};