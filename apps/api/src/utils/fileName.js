import crypto from "crypto";
import path from "path";

/**
 * Generate a unique, safe filename.
 * Keeps file extension, ignores original name.
 * Example: 1730875208123_9fa0cd2b.jpg
 */
export function generateUniqueFileName(originalName) {
  const ext = path.extname(originalName).toLowerCase(); // get .jpg, .png
  const hash = crypto.randomBytes(4).toString("hex"); // random short id
  const timestamp = Date.now(); // current time
  return `${timestamp}_${hash}${ext}`;
}
