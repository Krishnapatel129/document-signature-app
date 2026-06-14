import "./config/env.js";
import dns from "dns";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import signatureRoutes from "./routes/signatureRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import signatureRequestRoutes
from "./routes/signatureRequestRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";

// DNS setup
dns.setDefaultResultOrder("ipv4first");
dns.setServers([
  "8.8.8.8",
  "8.8.4.4",
  "1.1.1.1",
  "1.0.0.1",
]);

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ✅ Allow multiple frontend origins and echo the requester when allowed
const allowedOrigins = ["http://localhost:5173", "http://localhost:5175"];

// Simple explicit CORS handling for allowed origins (deterministic)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log('[CORS] request origin:', origin);
  // DEV: allow all origins to avoid CORS issues while developing
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());

// ✅ Connect DB
connectDB();

// ✅ Static uploads with CORS
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/signed", express.static(path.join(__dirname, "signed")));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/signatures", signatureRoutes);

app.use(
  "/signed",
  express.static(path.join(__dirname, "signed"))
);
app.use(
  "/api/signature-requests",
  signatureRequestRoutes
);
app.use(
  "/api/audit",
  auditRoutes
);
// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
