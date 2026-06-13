import mongoose from "mongoose";

const signatureSchema = new mongoose.Schema({
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Document",
    required: true,
  },
  coordinates: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  signer: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "signed"],
    default: "pending",
  },
}, { timestamps: true });

export default mongoose.model("Signature", signatureSchema);
