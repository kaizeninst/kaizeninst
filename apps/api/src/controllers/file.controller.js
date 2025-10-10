// ============================================================
//  FILE CONTROLLER (Google Cloud Storage)
// ============================================================

import fs from "fs";
import path from "path";
import { uploadToGCS, generateSignedUrl, deleteFromGCS } from "../utils/gcs.js";
import { generateUniqueFileName } from "../utils/fileName.js";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

/* ============================================================
   Upload image to Google Cloud Storage
   ============================================================ */
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Validate file size (max 5 MB)
    if (req.file.size > 5 * 1024 * 1024) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Image too large (max 5 MB)" });
    }

    // Validate file type and extension
    const mime = req.file.mimetype?.toLowerCase() || "";
    const ext = path.extname(req.file.originalname).toLowerCase();
    const isAllowed = ALLOWED_IMAGE_TYPES.includes(mime) && ALLOWED_EXT.includes(ext);

    if (!isAllowed) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res
        .status(400)
        .json({ error: "Only image files are allowed (.jpg, .png, .gif, .webp)" });
    }

    // Generate unique file name and upload to GCS
    const newFileName = generateUniqueFileName(req.file.originalname);
    const gcsPath = await uploadToGCS(req.file.path, newFileName);

    // Delete temp file after upload
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    return res.json({
      message: "Image uploaded successfully",
      path: gcsPath,
    });
  } catch (err) {
    console.error("GCS upload error:", err);
    return res.status(500).json({ error: err.message });
  }
};

/* ============================================================
   Generate signed URL for accessing GCS file
   ============================================================ */
export const getSignedUrl = async (req, res) => {
  try {
    const filePath = req.query.path;
    if (!filePath) {
      return res.status(400).json({ error: "Missing ?path= parameter" });
    }

    const url = await generateSignedUrl(filePath);
    return res.json({ url });
  } catch (err) {
    console.error("Signed URL error:", err);
    return res.status(500).json({ error: err.message });
  }
};

/* ============================================================
   Delete file from GCS
   ============================================================ */
export const deleteFile = async (req, res) => {
  try {
    const filePath = req.query.path;
    if (!filePath) {
      return res.status(400).json({ error: "Missing ?path= parameter" });
    }

    await deleteFromGCS(filePath);
    return res.json({ message: "Image deleted successfully", path: filePath });
  } catch (err) {
    console.error("Delete GCS file error:", err);
    return res.status(500).json({ error: err.message });
  }
};
