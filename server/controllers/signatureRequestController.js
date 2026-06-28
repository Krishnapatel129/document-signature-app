import crypto from "crypto";
import SignatureRequest from "../models/SignatureRequest.js";
import transporter from "../utils/sendEmail.js";
import { logAudit } from "../middleware/auditMiddleware.js";

export const createSignatureRequest = async (req, res) => {
  try {
    const { fileId, signerEmail } = req.body;

    const token = crypto.randomBytes(32).toString("hex");

    const request = await SignatureRequest.create({
      fileId,
      signerEmail,
      token,
    });

    const link = `${process.env.FRONTEND_URL}/sign/${token}`;

    res.status(201).json({
      success: true,
      emailSent: false,
      message: "Signature request created. Use this link if email fails.",
      link,
      request,
    });

    transporter
  .sendMail({
    from: process.env.EMAIL_USER,
    to: signerEmail,
    subject: "Document Signature Request",
    text: `You have received a document to sign.

Open this link:
${link}
`,
    html: `
      <div style="font-family: Arial, sans-serif; padding:20px">
        <h2>Document Signature Request</h2>

        <p>You have been requested to sign a document.</p>

        <p>Click the button below to open the document:</p>

        <a
          href="${link}"
          style="
            background:#2563eb;
            color:white;
            padding:12px 20px;
            text-decoration:none;
            border-radius:6px;
            display:inline-block;
          "
        >
          Open Document
        </a>

        <br><br>

        <p>If the button doesn't work, copy and paste this link:</p>

        <p>
          <a href="${link}">${link}</a>
        </p>
      </div>
    `,
  })
      .then(async () => {
        console.log("EMAIL SENT SUCCESSFULLY");

        await logAudit({
          fileId,
          action: "Signature Request Sent",
          actor: signerEmail,
          ip: req.ip,
        });
      })
      .catch((emailError) => {
        console.error("EMAIL SEND FAILED:", emailError.message);
      });
  } catch (error) {
    console.error("SIGNATURE REQUEST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRequestByToken = async (req, res) => {
  try {
    const request = await SignatureRequest.findOne({
      token: req.params.token,
    });

    if (!request) {
      return res.status(404).json({
        message: "Invalid link",
      });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const applyDecisionToSignatures = async ({
  request,
  decision,
  reason,
  Signature,
}) => {
  const { fileId } = request;

  // signer decides for all signatures belonging to this file/request
  const update = {
    status: decision === "accept" ? "Signed" : "Rejected",
    actedAt: new Date(),
  };

  if (decision === "reject") {
    update.rejectionReason = reason || "";
  }

  const result = await Signature.updateMany(
  { documentId: fileId },
  { $set: update }
);

  return result;
};

export const acceptSignatureRequest = async (req, res) => {
  try {
    const { token } = req.params;

    const request = await SignatureRequest.findOne({ token });

    if (!request) {
      return res.status(404).json({ message: "Invalid link" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: `Request already ${request.status}`,
      });
    }

    const Signature = (await import("../models/Signature.js")).default;

    await applyDecisionToSignatures({
      request,
      decision: "accept",
      reason: "",
      Signature,
    });

    request.status = "signed";
    request.rejectionReason = "";
    await request.save();

    await logAudit({
      fileId: request.fileId,
      action: "Signature Request Accepted",
      actor: request.signerEmail,
      ip: req.ip,
    });

    return res.json({ message: "Request accepted", request });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const rejectSignatureRequest = async (req, res) => {
  try {
    const { token } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        message: "Reason is required for rejection",
      });
    }

    const request = await SignatureRequest.findOne({ token });

    if (!request) {
      return res.status(404).json({ message: "Invalid link" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: `Request already ${request.status}`,
      });
    }

    const Signature = (await import("../models/Signature.js")).default;

    await applyDecisionToSignatures({
      request,
      decision: "reject",
      reason: reason.trim(),
      Signature,
    });

    request.status = "rejected";
    request.rejectionReason = reason.trim();
    await request.save();

    await logAudit({
      fileId: request.fileId,
      action: "Signature Request Rejected",
      actor: request.signerEmail,
      ip: req.ip,
    });

    return res.json({ message: "Request rejected", request });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
