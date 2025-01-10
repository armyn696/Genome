import { PDFViewer } from "./PDFViewer";

interface PDFContentProps {
  currentView: string;
  resourceId: string;
  onAnnotation?: (imageData: string) => void;
}

export const PDFContent = ({ currentView, resourceId, onAnnotation }: PDFContentProps) => {
  return (
    <div className="h-full">
      <PDFViewer resourceId={resourceId} onSendAnnotation={onAnnotation} />
    </div>
  );
};