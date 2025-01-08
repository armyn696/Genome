import React from 'react';

interface PDFViewerProps {
  resourceId: string;
  resourceName: string;
}

const PDFViewer = ({ resourceId, resourceName }: PDFViewerProps) => {
  return (
    <div className="h-full bg-background">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold text-foreground">{resourceName}</h2>
      </div>
      <div className="h-[calc(100%-4rem)]">
        <iframe 
          src={`/api/resources/${resourceId}`}
          className="w-full h-full border-0 bg-white"
          title={resourceName}
        />
      </div>
    </div>
  );
};

export default PDFViewer;