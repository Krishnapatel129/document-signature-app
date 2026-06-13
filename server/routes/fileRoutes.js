import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

// GET /api/files → list all uploaded files
router.get("/", (req, res) => {
  const uploadDir = path.join(process.cwd(), "uploads");

  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Unable to scan uploads folder" });
    }
    res.json({ files });
  });
});

export default router;
