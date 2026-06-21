import express from "express";
import upload from "../middleware/uploadMiddleware.js";

import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  signDocument,
  rejectDocument,
} from "../controllers/documentController.js";

const router = express.Router();

router.post(
  "/upload",
  upload.single("document"),
  uploadDocument
);

router.get("/", getDocuments);

router.get("/:id", getDocumentById);

router.put("/:id/sign", signDocument);

router.put("/:id/reject", rejectDocument);

export default router;