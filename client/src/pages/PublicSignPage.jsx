import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import PDFViewer from "../components/PDFViewer";

function PublicSignPage() {
  const { token } = useParams();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [decisionError, setDecisionError] = useState(null);
  const [rejectReason, setRejectReason] = useState("");


  useEffect(() => {
    fetchRequest();
  }, []);

  const fetchRequest = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/signature-requests/${token}`
      );

      setRequest(res.data);
    } catch (error) {
      console.error(error);
      alert("Invalid or expired signature link");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (!request) {
    return <h2>Signature request not found.</h2>;
  }

  const acceptRequest = async () => {
    setActionLoading(true);
    setDecisionError(null);
    try {
      const res = await axios.put(
        `http://localhost:5000/api/signature-requests/${token}/accept`
      );
      setRequest(res.data.request);
      alert("Request accepted");
    } catch (err) {
      setDecisionError(
        err.response?.data?.message || err.message
      );
    } finally {
      setActionLoading(false);
    }
  };

  const rejectRequest = async () => {
    setActionLoading(true);
    setDecisionError(null);
    try {
      const reasonToSend = (rejectReason || "").trim();
      const res = await axios.put(
        `http://localhost:5000/api/signature-requests/${token}/reject`,
        { reason: reasonToSend }
      );
      setRequest(res.data.request);
      alert("Request rejected");
    } catch (err) {
      setDecisionError(
        err.response?.data?.message || err.message
      );
    } finally {
      setActionLoading(false);
    }
  };

  const isDecisionMade = request.status !== "pending";

  return (
    <div>
      <h2>Public Signature Page</h2>

      <p>Signer: {request.signerEmail}</p>

      {request.status && (
        <p>Status: {request.status}</p>
      )}

      {request.rejectionReason && (
        <p style={{ color: "#b91c1c" }}>
          Rejection reason: {request.rejectionReason}
        </p>
      )}

      <div style={{ margin: "16px 0" }}>
        <button
          onClick={acceptRequest}
          disabled={actionLoading || isDecisionMade}
        >
          {actionLoading ? "Processing..." : "Accept (Sign)"}
        </button>

        <span style={{ margin: "0 10px" }} />

        <button
          onClick={() => {
            rejectRequest();
          }}

          disabled={actionLoading || isDecisionMade}
          style={{ background: "#dc2626", color: "white" }}
        >
          Reject
        </button>
      </div>

      {!isDecisionMade && (
        <div style={{ marginBottom: 12 }}>
          <label>
            Reason for rejection:
            <br />
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              style={{ width: "100%", maxWidth: 500 }}
            />
          </label>
        </div>
      )}

      {decisionError && (
        <p style={{ color: "red" }}>{decisionError}</p>
      )}

      <PDFViewer
        pdfUrl={`http://localhost:5000/uploads/sample.pdf`}
        fileId={request.fileId}
        isReadOnly={isDecisionMade}
      />
    </div>
  );
}

export default PublicSignPage;
