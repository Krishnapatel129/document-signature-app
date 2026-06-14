import mongoose from "mongoose";

const auditSchema = new mongoose.Schema(
  {
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      required: true,
    },

    action: {
      type: String,
      required: true,
    },

    actor: {
      type: String,
      required: true,
    },

    ipAddress: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Audit", auditSchema);