import mongoose from "mongoose";

const signatureSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Document",
  },

  signerEmail: String,

  x: Number,
  y: Number,

  status: {
    type: String,
    enum: ["Pending", "Signed", "Rejected"],
    default: "Pending",
  },

  rejectionReason: String,

  signedAt: Date,
});

export default mongoose.model("Signature", signatureSchema);