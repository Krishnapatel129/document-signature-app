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
import dashboardRoutes from "./routes/dashboardRoutes.js";
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

// Simple explicit CORS handling for allowed origins (deterministic)
const allowedOrigins = [
  "http://localhost:5173",
];


app.use(cors({
  origin: function (origin, callback) {
    // allow REST tools like Postman (no origin)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("[CORS BLOCKED]:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

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
app.use("/api/files", fileRoutes);
app.use("/api/dashboard", dashboardRoutes);

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
