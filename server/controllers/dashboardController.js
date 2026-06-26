import fs from "fs";
import Document from "../models/Document.js";
import SignatureRequest from "../models/SignatureRequest.js";
import Signature from "../models/Signature.js";

const normalizeStatus = (status) => {
  if (!status) return "pending";

  const s = String(status).toLowerCase();
  if (s === "signed") return "signed";
  if (s === "rejected") return "rejected";
  return "pending";
};

export const getDashboardDocuments = async (req, res) => {
  try {
    const documents = await Document.find().sort({ createdAt: -1 });

    const ids = documents.map((d) => d._id);

    const requests = await SignatureRequest.find({
      fileId: { $in: ids },
    });

    const signatures = await Signature.find({
      documentId: { $in: ids },
    });

    const statusByFileId = new Map();

    for (const r of requests) {
      const fileId = String(r.fileId);
      const next = normalizeStatus(r.status);
      statusByFileId.set(fileId, next);
    }

    for (const s of signatures) {
      const fileId = String(s.documentId);
      const next = normalizeStatus(s.status);

      if (next === "signed") {
        statusByFileId.set(fileId, "signed");
      }
    }

    const enriched = documents.map((doc) => {
      const status = statusByFileId.get(String(doc._id)) || "pending";

      const uiStatus =
        status === "signed"
          ? "Signed"
          : status === "rejected"
          ? "Rejected"
          : "Pending";

      return {
        _id: doc._id,
        fileName: doc.fileName,
        filePath: doc.filePath,
        fileSize: doc.fileSize,
        status: uiStatus,
        rejectionReason: "",
        createdAt: doc.createdAt,
      };
    });

    return res.json({ documents: enriched });
  } catch (error) {
    console.error("Dashboard Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ✅ Add this below getDashboardDocuments
export const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (doc.filePath && fs.existsSync(doc.filePath)) {
      fs.unlinkSync(doc.filePath);
    }

    await Signature.deleteMany({ documentId: doc._id });
    await SignatureRequest.deleteMany({ fileId: doc._id });

    await Document.findByIdAndDelete(doc._id);

    return res.json({ message: "PDF deleted successfully" });
  } catch (error) {
    console.error("Delete PDF Error:", error);
    return res.status(500).json({ message: error.message });
  }
};