import express from "express";
import Signature from "../models/Signature.js";

const router = express.Router();

const saveSignatureHandler = async (req, res) => {
  try {
    const { fileId, signer, x, y } = req.body;

    if (!fileId || signer == null || typeof x !== "number" || typeof y !== "number") {
      return res.status(400).json({ error: "fileId, signer, x and y are required" });
    }

    const normalizedX = Math.max(0, Math.min(1, x));
    const normalizedY = Math.max(0, Math.min(1, y));

    const signature = new Signature({
      fileId,
      signer,
      coordinates: { x: normalizedX, y: normalizedY },
    });

    await signature.save();
    res.json({ message: "Signature position saved", signature });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

router.post("/", saveSignatureHandler);
router.post("/save", saveSignatureHandler);

router.get("/file/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;
    const signatures = await Signature.find({ fileId });
    res.json({ signatures });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "signed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const signature = await Signature.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!signature) {
      return res.status(404).json({ error: "Signature not found" });
    }

    res.json({ message: "Signature status updated", signature });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
