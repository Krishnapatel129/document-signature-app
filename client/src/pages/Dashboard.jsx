import { useState } from "react";
import PDFViewer from "../components/PDFViewer";

function Dashboard() {
  const [selectedFile, setSelectedFile] = useState(null);

  // Temporary sample document
  const documents = [
    {
      _id: "648000000000000000000000",
      originalName: "sample.pdf",
      filename: "1781075189460.pdf",
    },
  ];

  return (
    <>
      {documents.map((file) => (
        <div key={file._id}>
          <h3>{file.originalName}</h3>

          <button onClick={() => setSelectedFile(file)}>
            Preview
          </button>
        </div>
      ))}

      {selectedFile && (
        <PDFViewer
          pdfUrl={`http://localhost:5000/uploads/${selectedFile.filename}`}
          fileId={selectedFile._id}
        />
      )}
    </>
  );
}

export default Dashboard;