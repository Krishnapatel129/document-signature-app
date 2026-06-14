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
    const { fileId, signer, x, y, pageNumber } = req.body;

    if (typeof pageNumber !== "number") {
      return res.status(400).json({ message: "pageNumber is required" });
    }

    const signature = await Signature.create({
      fileId,
      signer,
      pageNumber,
      coordinates: {
        x,
        y,
      },
      status: "pending",
    });

    return res.status(201).json({
      message: "Signature saved",
      signature,
    });

  } catch (error) {
    console.error("Create Signature Error:", error);

    return res.status(500).json({
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

    const signatures = await Signature.find({ fileId });

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

    const signatures = await Signature.find({ fileId });

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
      const pageIndex = (sig.pageNumber || 1) - 1; // 0-based for pdf-lib
      const page = pdfDoc.getPages()[pageIndex];

      if (!page) {
        throw new Error(`Invalid pageNumber: ${sig.pageNumber}`);
      }

      const { width: pageWidth, height: pageHeight } =
        pageDimensions(page);

      const x = sig.coordinates.x * pageWidth;

      const y =
        pageHeight - sig.coordinates.y * pageHeight;

      page.drawText(sig.signer, {
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