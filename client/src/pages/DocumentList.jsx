import { useState } from "react";
import axios from "axios";

function DocumentList() {
  const [files, setFiles] = useState([]);

  const sendRequest = async (fileId) => {
    try {
      const signerEmail = prompt("Enter signer email:");

      if (!signerEmail) return;

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/signature-requests`,
        {
          fileId,
          signerEmail,
        }
      );

      alert("Invitation sent successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to send invitation");
    }
  };

  return (
    <div>
      <h2>My Documents</h2>

      {files.map((file) => (
        <div
          key={file._id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
          }}
        >
          <h3>{file.originalName}</h3>

          <p>Status: {file.status || "Pending"}</p>

          {/* Existing Preview Button */}
          <button
            onClick={() => {
              // your preview logic here
            }}
          >
            Preview
          </button>

          {/* Add this button */}
          <button
            onClick={() => sendRequest(file._id)}
            style={{ marginLeft: "10px" }}
          >
            Request Signature
          </button>
         
        </div>
      ))}
    </div>
    
  );
}

export default DocumentList;