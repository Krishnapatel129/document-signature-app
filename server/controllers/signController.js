import fs from "fs";
import path from "path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

import Document from "../models/Document.js";
import Signature from "../models/Signature.js";

/*
=====================================
SAVE SIGNATURE
POST /api/signatures
=====================================
*/
export const createSignature = async (req, res) => {
  try {
    console.log("BODY RECEIVED:", req.body);

    const {
      fileId,
      signer,
      signerEmail,
      signatureText,
      x,
      y,
      pageNumber,
    } = req.body;

    await Signature.deleteMany({ documentId: fileId });

    const signature = await Signature.create({
  documentId: fileId,
  signer,
  signerEmail,
  signatureText,
  x,
  y,
  pageNumber,
  status: "Pending",
});

    return res.status(201).json({
      message: "Signature saved",
      signature,
    });
  } catch (error) {
    console.error("CREATE SIGNATURE ERROR:", error);

    return res.status(500).json({
      message: error.message,
      
    });
  }
};

    
export const signDocument = async (req, res) => {
  try {
    const { signatureText } = req.body;

    const signature = await Signature.findById(req.params.id);

    if (!signature) {
      return res.status(404).json({
        message: "Signature request not found",
      });
    }
    
    // Prevent duplicate actions
    if (signature.status !== "Pending") {
      return res.status(400).json({
        message: `Document already ${signature.status}`,
      });
    }

    signature.signatureText = signatureText;
    signature.status = "Signed";
    signature.actedAt = new Date();

    await signature.save();

    res.json({
      message: "Document signed successfully",
      signature,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
export const rejectDocument = async (req, res) => {
  try {
    const { reason } = req.body;

    const signature = await Signature.findById(req.params.id);

    if (!signature) {
      return res.status(404).json({
        message: "Signature request not found",
      });
    }

    signature.status = "Rejected";

    signature.rejectionReason = reason;

    signature.actedAt = new Date();

    await signature.save();

    res.json({
      message: "Document rejected",
      signature,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
/*
=====================================
GET SIGNATURES BY FILE
GET /api/signatures/file/:fileId
=====================================
*/
export const getSignaturesByFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    const signatures = await Signature.find({
      documentId: fileId,
    });

    return res.status(200).json({
      signatures,
    });
  } catch (error) {
    console.error("Get Signatures Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

/*
=====================================
GENERATE SIGNED PDF
POST /api/signatures/finalize/:fileId
=====================================
*/
export const generateSignedPDF = async (req, res) => {
  try {
    const { fileId } = req.params;

    console.log("Finalize fileId:", fileId);

    const document = await Document.findById(fileId);

    console.log("Document:", document);

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

   const signatures = await Signature.find({ documentId: fileId });
    console.log("Signatures:", signatures);

    if (signatures.length === 0) {
      return res.status(404).json({
        message: "No signatures found",
      });
    }

    const relativePath = document.filePath.replace(/\\/g, "/");

    const pdfPath = path.join(
      process.cwd(),
      relativePath
    );

    console.log("PDF Path:", pdfPath);

    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({
        message: "PDF file not found on disk",
      });
    }

    const existingPdfBytes = fs.readFileSync(pdfPath);

    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const font = await pdfDoc.embedFont(
      StandardFonts.Helvetica
    );

    const pageDimensions = (page) => {
      return {
        width: page.getWidth(),
        height: page.getHeight(),
      };
    };

signatures.forEach((sig) => {
  // Skip rejected signatures
  if (sig.status === "Rejected") {
    console.log("Skipping rejected signature:", sig._id);
    return;
  }

  // Skip old/invalid signatures
  sig.x === undefined || sig.y === undefined

  const pageIndex = (sig.pageNumber || 1) - 1;
  const page = pdfDoc.getPages()[pageIndex];

  if (!page) {
    console.log("Skipping invalid page:", sig._id, { pageIndex });
    return;
  }

  const { width: pageWidth, height: pageHeight } =
    pageDimensions(page);

 const x = sig.x * pageWidth;
const y = pageHeight - sig.y * pageHeight;

  console.log("Drawing signature", {
    sigId: sig._id?.toString?.(),
    signer: sig.signer,
    pageIndex,
    x,
    y,
    coordinates: sig.coordinates,
    pageNumber: sig.pageNumber,
  });

  const signatureText = (sig.signatureText ?? "").toString().trim();
  const signerText = (sig.signer ?? "").toString().trim();

  // Prefer the accepted/typed signature text.
  // Avoid drawing fallback/default values like "Signed".
  const textToDraw =
    signatureText && signatureText.toLowerCase() !== "signed"
      ? signatureText
      : signerText || "Signed";

  page.drawText(textToDraw, {
    x,
    y,
    size: 18,
    font,
    color: rgb(0, 0, 0),
  });
});
    const signedPdfBytes = await pdfDoc.save();

    const signedDir = path.join(
      process.cwd(),
      "uploads",
      "signed"
    );

    if (!fs.existsSync(signedDir)) {
      fs.mkdirSync(signedDir, {
        recursive: true,
      });
    }

    const signedFileName =
      `signed-${Date.now()}.pdf`;

    const signedPath = path.join(
      signedDir,
      signedFileName
    );

    fs.writeFileSync(
      signedPath,
      signedPdfBytes
    );
    document.status = "Signed";
document.signedAt = new Date();
document.signedFilePath = `/uploads/signed/${signedFileName}`;
await document.save();

    console.log("Signed PDF saved:", signedPath);

    return res.status(200).json({
      message: "Signed PDF generated",
      signedPdf: `/uploads/signed/${signedFileName}`,
    });

  } catch (error) {
    console.error("Generate PDF Error:", error);

    return res.status(500).json({
      message: "Failed to generate PDF",
      error: error.message,
    });
  }
};