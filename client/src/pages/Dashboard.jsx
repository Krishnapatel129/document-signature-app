import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import StatusFilter from "../components/StatusFilter";
import DocumentCard from "../components/DocumentCard";
import EmptyState from "../components/EmptyState";

const API_BASE = "http://localhost:5000";

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
              <DocumentCard key={file._id} document={file} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

