// models/Document.js

import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  fileName: String,
  filePath: String,
  fileSize: Number,

  status: {
    type: String,
    enum: ["Pending", "Signed", "Rejected"],
    default: "Pending",
  },

  rejectionReason: {
    type: String,
    default: "",
  },

  signedAt: Date,
});

export default mongoose.model("Document", documentSchema);