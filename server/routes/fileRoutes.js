import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import Document from "../models/Document.js";
const router = express.Router();

const uploadDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + ".pdf");
  },
});

const upload = multer({ storage });

// POST /api/files/upload
router.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    const document = await Document.create({
      fileName: req.file.originalname,
      filePath: `/uploads/${req.file.filename}`,
      fileSize: req.file.size,
      status: "Pending",
    });

    res.status(201).json({
      message: "PDF uploaded successfully",
      document,
    });
  } catch (error) {
    res.status(500).json({
      message: "Upload failed",
      error: error.message,
    });
  }
});

// GET /api/files
router.get("/", (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).json({
        error: "Unable to scan uploads folder",
      });
    }

    res.json({ files });
  });
});

export default router;