import express from "express";

import {
  createSignatureRequest,
  getRequestByToken,
} from "../controllers/signatureRequestController.js";

const router = express.Router();

router.post("/", createSignatureRequest);

router.get(
  "/:token",
  getRequestByToken
);

export default router;