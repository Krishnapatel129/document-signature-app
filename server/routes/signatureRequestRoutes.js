import express from "express";

import {
  acceptSignatureRequest,
  createSignatureRequest,
  getRequestByToken,
  rejectSignatureRequest,
} from "../controllers/signatureRequestController.js";

const router = express.Router();

router.post("/", createSignatureRequest);

router.get(
  "/:token",
  getRequestByToken
);

router.put(
  "/:token/accept",
  acceptSignatureRequest
);

router.put(
  "/:token/reject",
  rejectSignatureRequest
);

export default router;

