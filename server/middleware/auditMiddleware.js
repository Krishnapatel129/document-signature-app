import Audit from "../models/Audit.js";

export const logAudit = async ({
  fileId,
  action,
  actor,
  ip,
}) => {
  try {
    await Audit.create({
      fileId,
      action,
      actor,
      ipAddress: ip,
    });
  } catch (error) {
    console.error("Audit Error:", error);
  }
};