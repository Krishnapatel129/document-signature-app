import express from "express";
import {
  getDashboardDocuments,
  deleteDocument,
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/documents", getDashboardDocuments);
router.delete("/documents/:id", deleteDocument);

export default router;