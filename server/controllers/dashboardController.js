import Document from "../models/Document.js";
import SignatureRequest from "../models/SignatureRequest.js";

const normalizeStatus = (status) => {
  if (!status) return "pending";

  const s = String(status).toLowerCase();
  if (s === "signed") return "signed";
  if (s === "rejected") return "rejected";
  return "pending";
};

/**
 * GET /api/dashboard/documents
 * Returns documents augmented with their signature request status.
 */
export const getDashboardDocuments = async (req, res) => {
  try {
    const documents = await Document.find().sort({ createdAt: -1 });

    const ids = documents.map((d) => d._id);

    const requests = await SignatureRequest.find({ fileId: { $in: ids } });

    // Map fileId -> status (prefer signed > rejected > pending)
    const statusByFileId = new Map();
    for (const r of requests) {
      const fileId = String(r.fileId);
      const next = normalizeStatus(r.status);
      const prev = statusByFileId.get(fileId) || "pending";

      const rank = { pending: 1, signed: 3, rejected: 2 };
      if (rank[next] > rank[prev]) {
        statusByFileId.set(fileId, next);
      }
    }

    const enriched = documents.map((doc) => {
      const status = statusByFileId.get(String(doc._id)) || "pending";

      // Keep UI-friendly casing
      const uiStatus =
        status === "signed" ? "Signed" : status === "rejected" ? "Rejected" : "Pending";

      // Find the most relevant SignatureRequest for this file to surface rejectionReason.
      // (If multiple requests exist, prefer rejected > signed > pending.)
      const relatedRequests = requests.filter((r) => String(r.fileId) === String(doc._id));
      const pickReasonRequest = relatedRequests.find((r) => normalizeStatus(r.status) === "rejected")
        || relatedRequests.find((r) => normalizeStatus(r.status) === "signed")
        || relatedRequests.find((r) => normalizeStatus(r.status) === "pending");

      return {
        _id: doc._id,
        fileName: doc.fileName,
        filePath: doc.filePath,
        fileSize: doc.fileSize,
        status: uiStatus,
        rejectionReason:
          uiStatus === "Rejected" ? (pickReasonRequest?.rejectionReason || "") : "",
        createdAt: doc.createdAt,
      };
    });

    return res.json({ documents: enriched });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

