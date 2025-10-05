import jwt from "jsonwebtoken";

/* ============================================================
 * 🔹 ดึง Token จาก Cookie หรือ Header (Authorization: Bearer <token>)
 * ============================================================ */
function extractToken(req) {
  const fromCookie = req.cookies?.accessToken;
  const fromHeader = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  return fromCookie || fromHeader || null;
}

/* ============================================================
 * 🔹 ตรวจสอบและถอดรหัส JWT (verify ลายเซ็น + ตรวจวันหมดอายุ)
 * ============================================================ */
function verifyJwt(token) {
  const { JWT_SECRET, JWT_ISS = "kaizeninst-api" } = process.env;

  if (!JWT_SECRET) {
    throw new Error("Missing JWT_SECRET in environment variables");
  }

  try {
    return jwt.verify(token, JWT_SECRET, { issuer: JWT_ISS });
  } catch (err) {
    // ตรวจสอบประเภทของ JWT Error แล้วโยนกลับในรูปแบบเข้าใจง่าย
    switch (err.name) {
      case "TokenExpiredError":
        throw new Error("Token expired");
      case "JsonWebTokenError":
        throw new Error("Invalid token");
      case "NotBeforeError":
        throw new Error("Token not active yet");
      default:
        throw new Error("Token verification failed");
    }
  }
}

/* ============================================================
 * 🔹 Middleware สำหรับตรวจสอบ Role
 *   - หากไม่มี Token → 401 Unauthorized
 *   - หาก Token ผิด/หมดอายุ → 401 พร้อมสาเหตุ
 *   - หาก Role ไม่อยู่ในกลุ่มที่อนุญาต → 403 Forbidden
 * ============================================================ */
export function requireRole(...roles) {
  return (req, res, next) => {
    try {
      const token = extractToken(req);
      if (!token) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Missing authentication token",
        });
      }

      const payload = verifyJwt(token);

      if (!roles.includes(payload?.role)) {
        return res.status(403).json({
          error: "Forbidden",
          message: `Your role (${payload?.role}) is not allowed to access this resource`,
        });
      }

      // ✅ แนบข้อมูล user ลงใน req เพื่อใช้ใน controller ถัดไป
      req.user = payload;
      next();
    } catch (err) {
      // แยกข้อความตอบกลับตามประเภทข้อผิดพลาด
      let status = 401;
      let message = err.message || "Unauthorized";

      if (message === "Token expired") {
        status = 401;
      } else if (message === "Invalid token") {
        status = 401;
      } else if (message === "Token not active yet") {
        status = 401;
      } else if (message === "Token verification failed") {
        status = 401;
      } else if (message === "Missing JWT_SECRET in environment variables") {
        status = 500;
      }

      console.error("Auth middleware error:", message);
      return res.status(status).json({ error: "Unauthorized", message });
    }
  };
}

/* ============================================================
 * 🔹 Exports สำหรับใช้งานง่ายใน route
 * ============================================================ */

// ✅ ใช้เฉพาะ admin เท่านั้น
export const requireAdmin = requireRole("admin");

// ✅ ใช้ได้ทั้ง staff และ admin
export const requireStaffOrAdmin = requireRole("admin", "staff");
