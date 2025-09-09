// apps/api/src/middleware/auth.js
import jwt from "jsonwebtoken";

/** ดึง token จาก Cookie หรือ Authorization: Bearer <token> */
function extractToken(req) {
  const fromCookie = req.cookies?.token;
  const fromHeader = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  return fromCookie || fromHeader || null;
}

/** verify JWT: ตรวจลายเซ็น + exp อัตโนมัติ */
function verifyJwt(token) {
  const { JWT_SECRET, JWT_ISS = "kaizeninst-api" } = process.env;
  if (!JWT_SECRET) throw new Error("Missing JWT_SECRET");

  return jwt.verify(token, JWT_SECRET, { issuer: JWT_ISS });
}

export function requireRole(...roles) {
  return (req, res, next) => {
    try {
      const token = extractToken(req);
      if (!token) return res.status(401).json({ error: "Unauthorized" });
      const payload = verifyJwt(token);

      if (!roles.includes(payload?.role)) {
        return res.status(403).json({ error: "Forbidden" });
      }
      req.user = payload;
      next();
    } catch (_e) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  };
}

// convenience exports (optional)
export const requireAdmin = requireRole("admin");
export const requireStaffOrAdmin = requireRole("admin", "staff");
