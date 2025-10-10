// ============================================================
//  MAYBE AUTH MIDDLEWARE
// ============================================================

import { requireStaffOrAdmin } from "./auth.js";

/* ============================================================
   Middleware: optionally require authentication
   - In production → enforce staff/admin authentication
   - In development → skip authentication entirely
   ============================================================ */
export function maybeAuth(req, res, next) {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    // Use normal authentication in production
    return requireStaffOrAdmin(req, res, next);
  }

  // Skip auth in development
  return next();
}
