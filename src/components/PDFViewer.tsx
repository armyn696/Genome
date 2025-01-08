import { useEffect, useState } from 'react';
import { retrievePdf } from '@/utils/pdfStorage';

interface PDFViewerProps {
  resourceId: string;
}

export const PDFViewer = ({ resourceId }: PDFViewerProps) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadPdf = async () => {
      const pdf = await retrievePdf(resourceId);
      if (pdf) {
        setPdfUrl(pdf);
      }
    };
    loadPdf();
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