// controllers/documentController.js
import Document from "../models/Document.js"; // adjust path if needed

// Upload document
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const newDoc = new Document({
      filename: req.file.originalname,
      path: req.file.path,
      mimetype: req.file.mimetype,
    });

    await newDoc.save();
    res.status(201).json({ message: "Document uploaded successfully", document: newDoc });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all documents
export const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
