import mongoose from "mongoose";

const signatureSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },

    signer: {
      type: String,
      default: "Signed",
    },

    signerEmail: {
      type: String,
      required: true,
    },

    signatureText: {
      type: String,
      default: "Signed",
    },

    pageNumber: {
      type: Number,
      default: 1,
    },

    x: {
      type: Number,
      required: true,
    },

    y: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Signed", "Rejected"],
      default: "Pending",
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    signedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Signature", signatureSchema);