import { Storage } from "@google-cloud/storage";
import path from "path";

const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const bucketName = process.env.GCS_BUCKET_NAME;

/**
 * Upload local file to Google Cloud Storage
 * @param {string} localPath - path to local file (e.g. tmp/1234.png)
 * @param {string} filename - desired destination filename
 * @returns {Promise<string>} public file URL
 */
export async function uploadToGCS(localPath, filename) {
  const bucket = storage.bucket(bucketName);
  const destination = `products/${filename}`;

  await bucket.upload(localPath, {
    destination,
    metadata: { cacheControl: "public, max-age=31536000" },
  });

  return `https://storage.googleapis.com/${bucketName}/${destination}`;
}
