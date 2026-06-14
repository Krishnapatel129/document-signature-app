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

    const link = `${process.env.CLIENT_URL}/sign/${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: signerEmail,
      subject: "Document Signature Request",
      html: `
        <h2>Please Sign Document</h2>

        <p>Click the link below to sign:</p>

        <a href="${link}">
          ${link}
        </a>
      `,
    });

    // Audit Log
    await logAudit({
      fileId,
      action: "Signature Request Sent",
      actor: signerEmail,
      ip: req.ip,
    });

    res.status(201).json({
      success: true,
      message: "Email sent",
      request,
    });
  } catch (error) {
    console.error("SIGNATURE REQUEST ERROR:", error);

    res.status(500).json({
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