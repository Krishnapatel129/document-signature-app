import { Document, Page } from "react-pdf";
import { useState } from "react";

function PDFPreview({ fileUrl }) {
  const [numPages, setNumPages] = useState(null);

  return (
    <div>
      <Document
        file={fileUrl}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        onLoadError={(error) => {
          console.error("PDF ERROR:", error);
        }}
      >
        <Page pageNumber={1} width={600} />
      </Document>

      <p>Total Pages: {numPages}</p>
    </div>
  );
}

export default PDFPreview;