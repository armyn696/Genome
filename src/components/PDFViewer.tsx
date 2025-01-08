import { useEffect, useState } from 'react';
import { retrievePdf } from '@/utils/pdfStorage';
import { ScrollArea } from "@/components/ui/scroll-area";

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
    <ScrollArea className="w-full h-full">
      <div className="w-full h-full bg-white rounded-xl p-2">
        <iframe
          src={pdfUrl}
          className="w-full h-full rounded-xl border-2 border-border shadow-sm"
          title="PDF Viewer"
          style={{
            minHeight: "calc(100vh - 8rem)",
            backgroundColor: "white",
          }}
        />
      </div>
    </ScrollArea>
  );
};