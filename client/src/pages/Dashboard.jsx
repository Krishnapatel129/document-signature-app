import { useEffect, useState } from "react";
import axios from "axios";
import PDFPreview from "../components/PDFPreview";

function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState("");

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/docs"
      );

      setDocuments(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-5">
        My Documents
      </h1>

      <div className="grid gap-4">
        {documents.map((doc) => (
          <div
            key={doc._id}
            className="border rounded-lg p-4 shadow"
          >
            <h2 className="font-semibold">
              {doc.fileName}
            </h2>

            <p>
              Size: {(doc.fileSize / 1024).toFixed(2)} KB
            </p>

            <p>Status: {doc.status}</p>

            <button
  onClick={() =>
    window.open(
      `http://localhost:5000/${doc.filePath.replace(/\\/g, "/")}`,
      "_blank"
    )
  }
  className="bg-blue-500 text-white px-4 py-2 rounded"
>
  Preview
</button>
          </div>
        ))}
      </div>

      {selectedPdf && (
        <div className="mt-8">
          <PDFPreview fileUrl={selectedPdf} />
        </div>
      )}
    </div>
  );
}

export default Dashboard;