import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import StatusFilter from "../components/StatusFilter";
import DocumentCard from "../components/DocumentCard";
import EmptyState from "../components/EmptyState";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [filter, setFilter] = useState("all");

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/dashboard/documents`);

      // Expected: { documents: [...] }
      const rawFiles = Array.isArray(res.data?.documents)
        ? res.data.documents
        : [];

      setDocuments(rawFiles);
    } catch (err) {
      console.error("Fetch Documents Error:", err);
      setDocuments([]);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const filteredDocuments = useMemo(() => {
    if (filter === "all") return documents;

    return documents.filter(
      (doc) => doc.status?.toLowerCase() === filter.toLowerCase()
    );
  }, [documents, filter]);
const deleteDocument = async (id) => {
  if (!window.confirm("Are you sure you want to delete this PDF?")) return;

  try {
    await axios.delete(`${API_BASE}/api/dashboard/documents/${id}`);
    fetchDocuments();
  } catch (err) {
    console.error("Delete Error:", err);
    alert("Failed to delete PDF");
  }
};
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">


        <div className="mb-6">
          <StatusFilter value={filter} onChange={setFilter} />
        </div>

        {filteredDocuments.length === 0 ? (
  <EmptyState />
) : (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {filteredDocuments.map((file) => (
      <DocumentCard
        key={file._id}
        document={file}
        onDelete={deleteDocument}
      />
    ))}
  </div>
)}
      </div>
    </div>
    
  );
}

