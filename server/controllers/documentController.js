const Document = require("../models/Document");

const uploadDocument = async (req, res) => {
   
  try {
   
    console.log("FILE:", req.file);
    const document = await Document.create({
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      // uploadedBy: req.user.id
    });

    res.status(201).json({
      message: "Document uploaded successfully",
      document,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = { uploadDocument };