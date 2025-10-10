// ============================================================
//  GOOGLE CLOUD STORAGE UTILITIES
// ============================================================

import fs from "fs";
import { Storage } from "@google-cloud/storage";
import { generateUniqueFileName } from "./fileName.js";

// ============================================================
//  Initialize Google Cloud Storage client
// ============================================================
const projectId = process.env.GOOGLE_CLOUD_PROJECT;
const bucketName = process.env.GCS_BUCKET_NAME;

if (!projectId) console.warn("⚠️ Missing GOOGLE_CLOUD_PROJECT in .env");
if (!bucketName) console.warn("⚠️ Missing GCS_BUCKET_NAME in .env");

const storage = new Storage({ projectId });
const bucket = storage.bucket(bucketName);

/* ============================================================
   UPLOAD FILE TO GCS
   - Auto-generate unique filename
   - Delete temp file after upload
   ============================================================ */
export async function uploadToGCS(localPath, originalName) {
  const safeFileName = generateUniqueFileName(originalName);
  const destination = `uploads/${safeFileName}`;

  try {
    await bucket.upload(localPath, {
      destination,
      resumable: false,
      metadata: { cacheControl: "public, max-age=3600" }, // Cache 1 hour
    });

    console.log(`✅ Uploaded to GCS: ${destination}`);
    return safeFileName;
  } catch (err) {
    console.error("❌ Upload to GCS error:", err.message);
    throw err;
  } finally {
    if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
  }
}

/* ============================================================
   GENERATE SIGNED URL
   - Returns temporary (10-minute) public link
   ============================================================ */
export async function generateSignedUrl(fileName) {
  const filePath = `uploads/${fileName}`;

  try {
    const [url] = await bucket.file(filePath).getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes
    });
    return url;
  } catch (err) {
    console.error("❌ generateSignedUrl error:", err.message);
    return null;
  }
}

/* ============================================================
   DELETE FILE FROM GCS
   - Safe delete (ignore not found)
   ============================================================ */
export async function deleteFromGCS(fileName) {
  const filePath = `uploads/${fileName}`;

  try {
    await bucket.file(filePath).delete({ ignoreNotFound: true });
    console.log(`🗑️ Deleted from GCS: ${filePath}`);
  } catch (err) {
    if (err.code === 404) {
      console.warn(`⚠️ File not found in GCS: ${filePath}`);
      return;
    }
    console.error("❌ Delete GCS file error:", err.message);
    throw err;
  }
}
