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
      <div className="flex items-center justify-center h-full bg-black">
        Loading PDF...
      </div>
    );
  }

  return (
    <ScrollArea className="h-full bg-black">
      <iframe
        src={pdfUrl}
        className="w-full h-full"
        title="PDF Viewer"
        style={{ height: '100%', backgroundColor: "black" }}
      />
    </ScrollArea>
  );
};