import express from "express";

import {
  createSignature,
  getSignaturesByFile,
  generateSignedPDF,
  signDocument,
  rejectDocument,
} from "../controllers/signController.js";

const router = express.Router();

router.post("/", createSignature);

router.get("/file/:fileId", getSignaturesByFile);

router.post("/finalize/:fileId", generateSignedPDF);

router.put("/:id/sign", signDocument);

router.put("/:id/reject", rejectDocument);
router.get("/test", (req, res) => {
  res.json({ message: "Signature route working" });
});
export default router;