import axios from "axios";

const handlePdfClick = async (e, fileId) => {
  const rect = e.currentTarget.getBoundingClientRect();

  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  console.log("Clicked:", x, y);

  try {
    const response = await axios.post("http://localhost:5000/api/signatures", {
      fileId,
      signer: "John Doe", // you can make this dynamic later
      x,
      y,
    });

    console.log("Signature saved:", response.data);
  } catch (error) {
    console.error("Signature Save Error:", error.response?.data || error.message);
  }
};
