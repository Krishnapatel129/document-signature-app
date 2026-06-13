// models/Document.js
import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  mimetype: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const Document = mongoose.model("Document", documentSchema);

export default Document;
