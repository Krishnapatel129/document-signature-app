import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function Viewer() {
  const { id } = useParams();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="p-6">Loading document...</div>;
  }

  if (!document) {
    return <div className="p-6">Document not found.</div>;
  }
const handleSign = async () => {
  try {
    await axios.put(
      `http://localhost:5000/api/documents/${id}/sign`
    );

    alert("Document signed successfully");
    fetchDocument();
  } catch (error) {
    console.error(error);
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
  return (
  <div className="min-h-screen p-6 bg-gray-100">
    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow p-4">
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
            onClick={handleSign}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Sign
          </button>

          <button
            onClick={handleReject}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Reject
          </button>
        </div>
      )}

      <iframe
        src={`http://localhost:5000/${document.filePath}`}
        title="PDF Viewer"
        className="w-full h-[800px]"
      />
      {document.status === "Signed" && (
  <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
    <h3 className="text-green-700 font-semibold">
      ✓ Document Signed
    </h3>

    <p className="text-green-600 mt-1">
      Signed on:
      {" "}
      {new Date(document.signedAt).toLocaleString()}
    </p>
  </div>
)}
    </div>
  </div>
  
);
}