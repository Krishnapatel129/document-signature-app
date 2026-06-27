import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import PDFViewer from "../components/PDFViewer";


function PublicSignPage() {
  const { token } = useParams();

  const [request, setRequest] = useState(null);
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [decisionError, setDecisionError] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [signatureText, setSignatureText] = useState("");
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

const getFileUrl = (filePath) => {
  if (!filePath) return "";
  if (filePath.startsWith("http")) return filePath;
  return `${API_BASE}/${filePath.replace(/^\/+/, "")}`;
};

  useEffect(() => {
    fetchRequest();
  }, []);

  const fetchRequest = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/signature-requests/${token}`
      );

      setRequest(res.data);

      const docRes = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/documents/${res.data.fileId}`
      );

      setDocument(docRes.data);
    } catch (error) {
      console.error(error);
      alert("Invalid or expired signature link");
    } finally {
      setLoading(false);
    }
  };

  const acceptRequest = async () => {
  setActionLoading(true);
  setDecisionError(null);

  try {
    await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/signatures/finalize/${request.fileId}`
    );

    const res = await axios.put(
      `${import.meta.env.VITE_API_BASE_URL}/api/signature-requests/${token}/accept`
    );

    setRequest(res.data.request);
    alert("Document signed successfully");
  } catch (err) {
    setDecisionError(err.response?.data?.message || err.message);
  } finally {
    setActionLoading(false);
  }
};

  const rejectRequest = async () => {
    setActionLoading(true);
    setDecisionError(null);

    try {
      const reasonToSend = rejectReason.trim();

      const res = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/signature-requests/${token}/reject`,
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

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (!request) {
    return <h2>Signature request not found.</h2>;
  }

  const isDecisionMade = request.status !== "pending";

  return (
  <div className="min-h-screen bg-gray-100 py-8">
    <div className="max-w-7xl mx-auto px-4">

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Public Signature Page
        </h2>

        <div className="space-y-2 text-gray-700">
          <p>
            <span className="font-semibold">Signer:</span>{" "}
            {request.signerEmail}
          </p>

          <p>
            <span className="font-semibold">Status:</span>{" "}
            <span className="ml-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">
              {request.status}
            </span>
          </p>

          {request.rejectionReason && (
            <p className="text-red-600 font-medium">
              Rejection reason: {request.rejectionReason}
            </p>
          )}
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={acceptRequest}
            disabled={actionLoading || isDecisionMade}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition"
          >
            {actionLoading ? "Processing..." : "Accept (Sign)"}
          </button>

          <button
            onClick={rejectRequest}
            disabled={actionLoading || isDecisionMade}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition"
          >
            Reject
          </button>
        </div>

        {!isDecisionMade && (
          <div className="mt-5">
            <label className="block mb-2 font-medium text-gray-700">
              Reason for rejection:
            </label>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Enter reason..."
              className="w-full max-w-xl border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>
        )}

        {decisionError && (
          <p className="mt-4 text-red-600 font-medium">
            {decisionError}
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 flex justify-center overflow-auto">
        {document && (
  <PDFViewer
  pdfUrl={getFileUrl(document.filePath)}
  fileId={request.fileId}
  isReadOnly={isDecisionMade}
  signerEmail={request.signerEmail}
  signatureText={signatureText}
  setSignatureText={setSignatureText}
/>
)}
      </div>

    </div>
  </div>
);
}

export default PublicSignPage;