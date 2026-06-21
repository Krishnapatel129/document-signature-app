import express from "express";
import { getDashboardDocuments } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/documents", getDashboardDocuments);

export default router;

