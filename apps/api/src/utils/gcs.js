import { Storage } from "@google-cloud/storage";
import fs from "fs";
import { generateUniqueFileName } from "./fileName.js";

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});
const bucketName = process.env.GCS_BUCKET_NAME;
const bucket = storage.bucket(bucketName);

/**
 * Upload file to GCS
 * Automatically generate unique filename using timestamp + random hash.
 */
export async function uploadToGCS(localPath, originalName) {
  const safeFileName = generateUniqueFileName(originalName);
  const destination = `uploads/${safeFileName}`;

  await bucket.upload(localPath, { destination });

  if (fs.existsSync(localPath)) fs.unlinkSync(localPath);

  console.log("Uploaded to GCS:", destination);
  return destination;
}

/**
 * Generate Signed URL (temporary public link)
 * ใช้สำหรับโหลดไฟล์แบบ private
 */
export async function generateSignedUrl(filePath) {
  const [url] = await bucket.file(filePath).getSignedUrl({
    version: "v4",
    action: "read",
    expires: Date.now() + 10 * 60 * 1000, // 10 minutes
  });
  return url;
}

/**
 * Delete file from GCS (safe)
 */
export async function deleteFromGCS(filePath) {
  try {
    await bucket.file(filePath).delete({ ignoreNotFound: true });
    console.log(`Deleted from GCS: ${filePath}`);
  } catch (err) {
    console.error("Delete GCS file error:", err.message);
  }
}
