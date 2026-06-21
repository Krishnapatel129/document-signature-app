import Document from "../models/Document.js";

// Upload document
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const newDoc = new Document({
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
    });

    await newDoc.save();

    res.status(201).json({
      message: "Document uploaded successfully",
      document: newDoc,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// Get all documents
export const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find();

    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// Get document by ID
export const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    res.status(200).json(document);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
// Sign document
export const signDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    document.status = "Signed";
    document.signedAt = new Date();

    await document.save();

    res.status(200).json({
      message: "Document signed successfully",
      document,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// Reject document
export const rejectDocument = async (req, res) => {
  try {
    const { reason } = req.body;

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    document.status = "Rejected";
    document.rejectionReason = reason;

    await document.save();

    res.status(200).json({
      message: "Document rejected successfully",
      document,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};