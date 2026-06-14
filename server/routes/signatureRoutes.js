import express from "express";
import {
  createSignature,
  getSignaturesByFile,
  generateSignedPDF,
} from "../controllers/signController.js";

const router = express.Router();

router.post("/", createSignature);

router.get(
  "/file/:fileId",
  getSignaturesByFile
);

router.post(
  "/finalize/:fileId",
  generateSignedPDF
);

export default router;