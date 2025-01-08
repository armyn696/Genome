import { useEffect, useState } from 'react';

interface PDFViewerProps {
  resourceId: string;
}

export const PDFViewer = ({ resourceId }: PDFViewerProps) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    // For now, we'll use a data URL from the uploaded file
    // In a real app, this would fetch from your API
    const storedPdf = localStorage.getItem(`pdf_${resourceId}`);
    if (storedPdf) {
      setPdfUrl(storedPdf);
    }
  }, [resourceId]);

  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center h-full">
        Loading PDF...
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-100">
      <iframe
        src={pdfUrl}
        className="w-full h-full rounded-lg border border-gray-200"
        title="PDF Viewer"
      />
    </div>
  );
};