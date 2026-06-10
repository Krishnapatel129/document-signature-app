const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");

dns.setServers([
  "8.8.8.8",
  "8.8.4.4",
  "1.1.1.1",
  "1.0.0.1",
]);
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const documentRoutes = require("./routes/documentRoutes");

connectDB();

app.use(cors());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/docs", documentRoutes);
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("Document Signature API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});