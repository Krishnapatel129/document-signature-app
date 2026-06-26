import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function Viewer() {
  const { id } = useParams();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSignature, setShowSignature] = useState(false);
  const [position, setPosition] = useState({
    x: 120,
    y: 120,
  });

  useEffect(() => {
    fetchDocument();
  }, []);

  const fetchDocument = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/documents/${id}`
      );
      setDocument(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (e) => {
    const pdfArea = window.document.getElementById("pdf-area");
    const rect = pdfArea.getBoundingClientRect();

    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

 const handleSign = async () => {
  try {
    await axios.post("http://localhost:5000/api/signatures", {
      fileId: id,
      signer: "K.H.Patel",
      signerEmail: "patelkrishna21092003@gmail.com",
      signatureText: "K.H.Patel",
      x: 0.65,
      y: 0.85,
      pageNumber: 1,
    });

    await axios.post(
      `http://localhost:5000/api/signatures/finalize/${id}`
    );

    alert("Document signed successfully");
    fetchDocument();
  } catch (error) {
    console.error(error.response?.data || error);
    alert(error.response?.data?.message || "Signing failed");
  }
};
 

  const handleReject = async () => {
    const reason = prompt("Enter rejection reason");

    if (!reason) return;

    try {
      await axios.put(
        `http://localhost:5000/api/documents/${id}/reject`,
        { reason }
      );

      alert("Document rejected");
      fetchDocument();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div className="p-6">Loading document...</div>;
  }

  if (!document) {
    return <div className="p-6">Document not found.</div>;
  }
  const sendSignatureRequest = async () => {
  try {
    const signerEmail = prompt("Enter signer email");

    if (!signerEmail) return;

    await axios.post(
      "http://localhost:5000/api/signature-requests",
      {
        fileId: document._id,
        signerEmail,
      }
    );

    alert("Signature request email sent!");
  } catch (error) {
    console.error(error);
    alert("Failed to send email");
    console.log("FILE ID RECEIVED:", fileId);
  }
};

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-4">
        <h1 className="text-xl font-bold mb-2">
          {document.fileName}
        </h1>

        <p className="mb-4">
          Status:
          <span className="font-semibold ml-2">
            {document.status}
          </span>
        </p>

        {document.status === "Rejected" && (
          <p className="text-red-500 mb-4">
            Reason: {document.rejectionReason}
          </p>
        )}

        {document.status === "Pending" && (
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setShowSignature(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              ✍ Add Signature
            </button>

            <button
              onClick={handleSign}
              disabled={!showSignature}
              className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
            >
              Final Sign
            </button>

            <button
              onClick={handleReject}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Reject
            </button>
            <button
  onClick={sendSignatureRequest}
  className="bg-blue-600 text-white px-4 py-2 rounded"
>
  Send Signature Request
</button>
          </div>
        )}

        {document.status === "Signed" && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
            <h3 className="text-green-700 font-semibold">
              ✓ Document Signed
            </h3>

            <p className="text-green-600 mt-1">
              Signed on:{" "}
              {document.signedAt
                ? new Date(document.signedAt).toLocaleString()
                : "N/A"}
            </p>
          </div>
        )}

        <div id="pdf-area" className="relative w-full h-[800px] border">
         <iframe
  src={`http://localhost:5000${document.signedFilePath || "/" + document.filePath}`}
  title="PDF Viewer"
  className="w-full h-full"
/>

          {showSignature && document.status === "Pending" && (
            <div
              draggable
              onDragEnd={handleDragEnd}
              style={{
                left: position.x,
                top: position.y,
              }}
              className="absolute z-50 cursor-move bg-yellow-200 border-2 border-yellow-500 px-5 py-2 rounded shadow font-semibold text-black"
            >
              ✍ Krishna Patel
            </div>
            
          )}
        </div>
      </div>
    </div>
  );
}