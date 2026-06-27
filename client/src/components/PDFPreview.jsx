import axios from "axios";
import { useMemo, useState } from "react";
import { Document, Page } from "react-pdf";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * Preview/placement UI.
 * - Clicking on the page records a pending signature
 * - Overlay shows saved signatures for the current page
 */
function PDFPreview({ pdfUrl, fileId, signer = "K. H. Patel" }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [signatures, setSignatures] = useState([]);
  const [error, setError] = useState(null);
  const [reason, setReason] = useState("");
  const [selectedSignature, setSelectedSignature] = useState(null);

  const pageSignatures = useMemo(
    () =>
      signatures.filter(
        (s) => !s.pageNumber || s.pageNumber === pageNumber
      ),
    [signatures, pageNumber]
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

  // initial + when fileId changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => {
    loadSignatures();
  }, [fileId]);

  const saveSignature = async (x, y) => {
    if (!fileId) return;

    try {
      const response = await axios.post(
        `${API_BASE}/api/signatures`,
        {
          fileId,
          signer,
          x,
          y,
          pageNumber,
        }
      );

      setSignatures((prev) => [
        ...prev,
        response.data.signature,
      ]);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message
      );
    }
  };

  const handlePageClick = async (e) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();

    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // clamp to [0,1]
    const cx = Math.max(0, Math.min(1, x));
    const cy = Math.max(0, Math.min(1, y));

    await saveSignature(cx, cy);
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
        `${API_BASE}/api/signatures/finalize/${fileId}`
      );

      alert("Signed PDF generated!");

      window.open(
        `${API_BASE}${res.data.signedPdf}`,
        "_blank"
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message
      );
    }
  };


const handleSign = async () => {
  if (!selectedSignature) {
    alert("Select a signature first");
    return;
  }

  try {
    await axios.put(
      `${API_BASE}/api/signatures/${selectedSignature._id}/sign`,
      {
        signatureText: signer,
      }
    );

    alert("Document signed");

    loadSignatures();
    setSelectedSignature(null);
  } catch (err) {
    alert(
      err.response?.data?.message || err.message
    );
  }
};

const handleReject = async () => {
  if (!selectedSignature) {
    alert("Select a signature first");
    return;
  }

  try {
    await axios.put(
      `${API_BASE}/api/signatures/${selectedSignature._id}/reject`,
      {
        reason,
      }
    );

    alert("Document rejected");

    loadSignatures();

    setSelectedSignature(null);
    setReason("");
  } catch (err) {
    alert(
      err.response?.data?.message || err.message
    );
  }
};
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px 14px",
            borderRadius: "999px",
            border: "2px solid #2563eb",
            background: "rgba(59,130,246,0.08)",
            color: "#1d4ed8",
            cursor: "default",
            userSelect: "none",
          }}
        >
          Click on the PDF to place a signature
        </div>
      </div>

      <div
        style={{
          position: "relative",
          display: "inline-block",
          border: "2px solid transparent",
        }}
      >
        <Document
          file={pdfUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          onLoadError={(err) => {
            // react-pdf throws these
            setError(err?.message || "PDF load error");
          }}
        >
          <div onClick={handlePageClick} style={{ position: "relative" }}>
            <Page
              pageNumber={pageNumber}
              width={600}
              renderTextLayer={false}
            />
          </div>
        </Document>

        {pageSignatures.map((signature) => (
  <div
    key={signature._id}
    onClick={() => setSelectedSignature(signature)}
            style={{
              position: "absolute",
              left: `${signature.coordinates.x * 100}%`,
              top: `${signature.coordinates.y * 100}%`,
              transform: "translate(-50%, -50%)",
              width: 28,
              height: 28,
              borderRadius: "50%",
              border: "2px solid #2563eb",
             background:
  signature.status === "Signed"
    ? "#10b981"
    : signature.status === "Rejected"
    ? "#ef4444"
    : "rgba(59,130,246,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              pointerEvents: "none",
            }}
            title={`${signature.signer} - ${signature.status}`}
          >
           {
  signature.status === "Signed"
    ? "S"
    : signature.status === "Rejected"
    ? "R"
    : "P"
}
          </div>
        ))}
      </div>

      {numPages && (
        <div style={{ marginTop: 10 }}>
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
      {selectedSignature && (
  <div style={{ marginTop: 20 }}>
    <p>
      Selected: {selectedSignature.signer}
    </p>

    <button onClick={handleSign}>
      Accept & Sign
    </button>

    <br /><br />

    <textarea
      placeholder="Reason for rejection"
      value={reason}
      onChange={(e) => setReason(e.target.value)}
      rows={3}
      cols={30}
    />

    <br /><br />

    <button onClick={handleReject}>
      Reject
    </button>
  </div>
)}
      <div style={{ marginTop: 20 }}>
        <button onClick={handleFinalize} disabled={!fileId}>
          Finalize PDF
        </button>
      </div>
    </div>
    
  );
}


export default PDFPreview;

