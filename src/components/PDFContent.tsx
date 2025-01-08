import { PDFViewer } from "@/components/PDFViewer";

interface PDFContentProps {
  currentView: 'chat' | 'notes' | 'pdf' | 'transcript' | 'dual';
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
    default:
      return <PDFViewer resourceId={resourceId} />;
  }
};