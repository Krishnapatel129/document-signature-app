import express from "express";
import {
  getAuditTrail,
} from "../controllers/auditController.js";

const router = express.Router();

router.get("/:fileId", getAuditTrail);

export default router;