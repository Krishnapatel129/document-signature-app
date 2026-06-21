import { useEffect, useState } from "react";
import axios from "axios";
import DocumentCard from "../components/DocumentCard";

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/files"
      );

      // Normalize API response: it may return either an array or an object like { documents: [...] }
      const normalized = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.documents)
          ? res.data.documents
          : [];

      setDocuments(normalized);
    } catch (err) {
      console.error(err);
    }
  };

  // Ensure we never call .filter/.map on a non-array (prevents runtime crash)
  const safeDocuments = Array.isArray(documents) ? documents : [];

  const filteredDocuments =
    filter === "All"
      ? safeDocuments
      : safeDocuments.filter(
          (doc) =>
            doc.status?.toLowerCase() ===
            filter.toLowerCase()
        );

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    
    <div>
      <h1 className="text-3xl font-bold text-gray-800">
        📄 Document Dashboard
      </h1>

      <p className="text-gray-500 mt-1">
        Manage, review, sign and track document status.
      </p>
    </div>

    <div>
      <select
        className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      >
        <option>All</option>
        <option>Pending</option>
        <option>Signed</option>
        <option>Rejected</option>
      </select>
    </div>

  </div>
</div>

  );
}