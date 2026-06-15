import mongoose from "mongoose";

const signatureSchema = new mongoose.Schema(
  {
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      required: true,
    },

    // Coordinates are saved by PDFViewer drag/drop + consumed by generateSignedPDF
    coordinates: {
      x: { type: Number },
      y: { type: Number },
    },

    // 1-based page number (matches controller/UI)
    pageNumber: { type: Number },

    signer: { type: String, default: "" },
    signatureText: String,


    status: {
      type: String,
      enum: ["Pending", "Signed", "Rejected"],
      default: "Pending",
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    actedAt: Date,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Signature", signatureSchema);

