import { PDFViewer } from "@/components/PDFViewer";

interface PDFContentProps {
  currentView: 'chat' | 'notes' | 'pdf' | 'transcript' | 'dual' | 'quiz' | 'flashcards' | 'mindmap' | 'matchgame';
  resourceId: string;
}

export const PDFContent = ({ currentView, resourceId }: PDFContentProps) => {
  switch (currentView) {
    case 'chat':
      return (
        <div className="h-[calc(100vh-7rem)] flex items-center justify-center text-muted-foreground bg-black">
          Chat view coming soon...
        </div>
      );
    case 'notes':
      return (
        <div className="h-[calc(100vh-7rem)] flex items-center justify-center text-muted-foreground bg-black">
          Notes view coming soon...
        </div>
      );
    case 'pdf':
      return <PDFViewer resourceId={resourceId} />;
    case 'transcript':
      return (
        <div className="h-[calc(100vh-7rem)] flex items-center justify-center text-muted-foreground bg-black">
          Transcript view coming soon...
        </div>
      );
    case 'dual':
      return (
        <div className="h-[calc(100vh-7rem)] flex items-center justify-center text-muted-foreground bg-black">
          Dual view coming soon...
        </div>
      );
    case 'quiz':
      return (
        <div className="h-[calc(100vh-7rem)] flex items-center justify-center text-muted-foreground bg-black">
          Quiz view coming soon...
        </div>
      );
    case 'flashcards':
      return (
        <div className="h-[calc(100vh-7rem)] flex items-center justify-center text-muted-foreground bg-black">
          Flashcards view coming soon...
        </div>
      );
    case 'mindmap':
      return (
        <div className="h-[calc(100vh-7rem)] flex items-center justify-center text-muted-foreground bg-black">
          Mindmap view coming soon...
        </div>
      );
    case 'matchgame':
      return (
        <div className="h-[calc(100vh-7rem)] flex items-center justify-center text-muted-foreground bg-black">
          Match Game view coming soon...
        </div>
      );
    default:
      return <PDFViewer resourceId={resourceId} />;
  }
};