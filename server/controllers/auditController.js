import Audit from "../models/Audit.js";

export const getAuditTrail = async (
  req,
  res
) => {
  try {
    const audits = await Audit.find({
      fileId: req.params.fileId,
    }).sort({
      createdAt: -1,
    });

    res.json(audits);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};