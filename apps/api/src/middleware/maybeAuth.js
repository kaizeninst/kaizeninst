// apps/api/src/middleware/maybeAuth.js
import { requireStaffOrAdmin } from "./auth.js";

/**
 * ใช้แทน middleware auth ปกติ
 * - ถ้า NODE_ENV=production → ใช้ requireStaffOrAdmin จริง
 * - ถ้า NODE_ENV=development → ข้าม auth (เรียก next() ทันที)
 */
export function maybeAuth(req, res, next) {
  const isProd = process.env.NODE_ENV === "production";

  if (isProd) {
    return requireStaffOrAdmin(req, res, next);
  }

  // dev mode: ไม่เช็ค token เลย
  return next();
}
