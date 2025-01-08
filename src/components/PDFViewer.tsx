import { useEffect, useState } from 'react';

interface PDFViewerProps {
  resourceId: string;
}

export const PDFViewer = ({ resourceId }: PDFViewerProps) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    // In a real application, this would fetch from your API
    setPdfUrl(`/api/resources/${resourceId}`);
  }, [resourceId]);

  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center h-full">
        Loading PDF...
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-100 p-4">
      <iframe
        src={pdfUrl}
        className="w-full h-full rounded-lg border border-gray-200"
        title="PDF Viewer"
      />
    </div>
  );
};