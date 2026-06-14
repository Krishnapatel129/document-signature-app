import axios from "axios";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

function PDFViewer({ pdfUrl, fileId }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [signatures, setSignatures] = useState([]);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const loadSignatures = async () => {
      if (!fileId) return;
      try {
        const response = await axios.get(
          `${API_BASE}/api/signatures/file/${fileId}`
        );
        setSignatures(response.data.signatures || []);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      }
    };

    loadSignatures();
  }, [fileId]);

  const saveSignature = async (x, y) => {
    try {
      const response = await axios.post(`${API_BASE}/api/signatures`, {
        fileId,
        signer: "John Doe",
        x,
        y,
      });

      setSignatures((prev) => [...prev, response.data.signature]);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handlePdfClick = async (event) => {
    if (!fileId) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    await saveSignature(x, y);
  };

  const handleDragStart = (event) => {
    event.dataTransfer.setData("text/plain", "signature-field");
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setDragActive(false);

    const type = event.dataTransfer.getData("text/plain");
    if (type !== "signature-field" || !fileId) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    await saveSignature(x, y);
  };

  const nextPage = () => {
    if (pageNumber < numPages) setPageNumber(pageNumber + 1);
  };

  const prevPage = () => {
    if (pageNumber > 1) setPageNumber(pageNumber - 1);
  };
  const handleFinalize = async () => {
  try {
    const res = await axios.post(
      `http://localhost:5000/api/signatures/finalize/${fileId}`
    );

    alert("Signed PDF generated!");

    window.open(
      `http://localhost:5000${res.data.signedPdf}`,
      "_blank"
    );

  } catch (err) {
    console.error(err);

    alert("Failed to generate PDF");
  }
};
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ marginBottom: "12px" }}>
        <div
          draggable
          onDragStart={handleDragStart}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px 14px",
            borderRadius: "999px",
            border: "2px dashed #2563eb",
            background: "rgba(59, 130, 246, 0.08)",
            color: "#1d4ed8",
            cursor: "grab",
            userSelect: "none",
          }}
        >
          Drag signature field onto PDF
        </div>
      </div>

      <div
        onClick={handlePdfClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          position: "relative",
          display: "inline-block",
          cursor: "crosshair",
          border: dragActive ? "2px dashed #2563eb" : "2px solid transparent",
          transition: "border-color 0.2s ease",
        }}
      >
        <Document
          file={pdfUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          onLoadError={(error) => console.error("PDF Error:", error)}
        >
          <Page pageNumber={pageNumber} width={600} />
        </Document>

        {signatures.map((signature) => {
          const left = `${signature.coordinates.x * 100}%`;
          const top = `${signature.coordinates.y * 100}%`;
          return (
            <div
              key={signature._id}
              style={{
                position: "absolute",
                left,
                top,
                transform: "translate(-50%, -50%)",
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                border: "2px solid #2563eb",
                background:
                  signature.status === "signed"
                    ? "#10b981"
                    : "rgba(59, 130, 246, 0.2)",
                color: "#111827",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: "700",
                pointerEvents: "none",
              }}
              title={`${signature.signer} — ${signature.status}`}
            >
              {signature.status === "signed" ? "S" : "P"}
            </div>
          );
        })}
      </div>

      {numPages && (
        <div style={{ marginTop: "10px" }}>
          <button onClick={prevPage} disabled={pageNumber <= 1}>
            Prev
          </button>
          <span style={{ margin: "0 10px" }}>
            Page {pageNumber} of {numPages}
          </span>
          <button onClick={nextPage} disabled={pageNumber >= numPages}>
            Next
          </button>
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={handleFinalize}>
  Finalize PDF
</button>
    </div>
    
  );
}

export default PDFViewer;
