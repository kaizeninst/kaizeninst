import { verifyToken } from "../utils/jwt.js";

export function requireAdmin(req, res, next) {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const payload = verifyToken(token);

    if (payload?.role !== "admin" && payload?.role !== "staff") {
      return res.status(403).json({ error: "Forbidden" });
    }

    // แนบ payload ให้ handler ใช้งานต่อ
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
