const Document = require("../models/Document");

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const document = await Document.create({
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      status: "Pending",
    });

    res.status(201).json({
      message: "Document uploaded successfully",
      document,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const documents = await Document.find().sort({
      createdAt: -1,
    });

    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};