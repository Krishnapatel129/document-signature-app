import axios from "axios";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useEffect, useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function PDFViewer({ pdfUrl, fileId }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [signatures, setSignatures] = useState([]);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Keep only signatures for the currently displayed page
  const pageSignatures = signatures.filter(
    (s) => !s.pageNumber || s.pageNumber === pageNumber
  );

  const loadSignatures = async () => {
    if (!fileId) return;

    try {
      const response = await axios.get(
        `${API_BASE}/api/signatures/file/${fileId}`
      );

      setSignatures(response.data.signatures || []);
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.error || err.message
      );
    }
  };

  useEffect(() => {
    loadSignatures();
  }, [fileId]);
  const saveSignature = async (x, y) => {
  try {
    const response = await axios.post(
      `${API_BASE}/api/signatures`,
      {
        fileId,
        signer: "K. H. Patel",
        x,
        y,
        pageNumber,
      }
    );

    console.log("Saved:", response.data);

    setSignatures((prev) => [
      ...prev,
      response.data.signature,
    ]);

  } catch (err) {
    console.error(err);
  }
};

  const handleDragStart = (event) => {
    event.dataTransfer.setData(
      "text/plain",
      "signature-field"
    );
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

    const type =
      event.dataTransfer.getData(
        "text/plain"
      );

    if (
      type !== "signature-field" ||
      !fileId
    ) {
      return;
    }

    const rect =
      event.currentTarget.getBoundingClientRect();

    const x =
      (event.clientX - rect.left) /
      rect.width;

    const y =
      (event.clientY - rect.top) /
      rect.height;

    await saveSignature(x, y);
  };

  const nextPage = () => {
    if (pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  const prevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const handleFinalize = async () => {
    try {
      const res = await axios.post(
        `${API_BASE}/api/signatures/finalize/${fileId}`
      );

      alert("Signed PDF generated!");

      window.open(
        `${API_BASE}${res.data.signedPdf}`,
        "_blank"
      );
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message
      );
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ marginBottom: 12 }}>
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
            background:
              "rgba(59,130,246,0.08)",
            color: "#1d4ed8",
            cursor: "grab",
            userSelect: "none",
          }}
        >
          Drag signature field onto PDF
        </div>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          position: "relative",
          display: "inline-block",
          border: dragActive
            ? "2px dashed #2563eb"
            : "2px solid transparent",
        }}
      >
        <Document
          file={pdfUrl}
          onLoadSuccess={({ numPages }) =>
            setNumPages(numPages)
          }
          onLoadError={(err) => {
            console.error(
              "PDF Error:",
              err
            );
          }}
        >
          <Page
            pageNumber={pageNumber}
            width={600}
          />
        </Document>

        {pageSignatures.map((signature) => (
          <div
            key={signature._id}
            style={{
              position: "absolute",
              left: `${
                signature.coordinates.x *
                100
              }%`,
              top: `${
                signature.coordinates.y *
                100
              }%`,
              transform:
                "translate(-50%, -50%)",
              width: 28,
              height: 28,
              borderRadius: "50%",
              border:
                "2px solid #2563eb",
              background:
                signature.status ===
                "signed"
                  ? "#10b981"
                  : "rgba(59,130,246,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              pointerEvents: "none",
            }}
            title={`${signature.signer} - ${signature.status}`}
          >
            {signature.status === "signed"
              ? "S"
              : "P"}
          </div>
        ))}
      </div>

      {numPages && (
        <div style={{ marginTop: 10 }}>
          <button
            onClick={prevPage}
            disabled={pageNumber <= 1}
          >
            Prev
          </button>

          <span
            style={{ margin: "0 10px" }}
          >
            Page {pageNumber} of{" "}
            {numPages}
          </span>

          <button
            onClick={nextPage}
            disabled={
              pageNumber >= numPages
            }
          >
            Next
          </button>
        </div>
      )}

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      <div style={{ marginTop: 20 }}>
        <button
          onClick={handleFinalize}
        >
          Finalize PDF
        </button>
      </div>
    </div>
  );
}

export default PDFViewer;