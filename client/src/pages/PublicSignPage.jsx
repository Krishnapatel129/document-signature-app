import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import PDFViewer from "../components/PDFViewer";

function PublicSignPage() {
  const { token } = useParams();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div>
      <h2>Public Signature Page</h2>

      <p>
        Signer: {request.signerEmail}
      </p>

      <PDFViewer
        pdfUrl={`http://localhost:5000/uploads/sample.pdf`}
        fileId={request.fileId}
      />
    </div>
  );
}

export default PublicSignPage;