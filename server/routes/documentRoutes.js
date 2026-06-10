const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  uploadDocument,
} = require("../controllers/documentController");

console.log("UPLOAD =", upload);

router.post(
  "/upload",
  protect,
  upload.single("document"),
  uploadDocument
);

module.exports = router;