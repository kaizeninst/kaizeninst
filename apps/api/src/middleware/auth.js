// ============================================================
//  AUTH MIDDLEWARE
// ============================================================

import jwt from "jsonwebtoken";

/* ============================================================
   Extract token from cookie or Authorization header
   ============================================================ */
function extractToken(req) {
  const fromCookie = req.cookies?.accessToken;
  const fromHeader = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  return fromCookie || fromHeader || null;
}

/* ============================================================
   Verify JWT (signature + expiration)
   ============================================================ */
function verifyJwt(token) {
  const { JWT_SECRET, JWT_ISS = "kaizeninst-api" } = process.env;

  if (!JWT_SECRET) {
    throw new Error("Missing JWT_SECRET in environment variables");
  }

  try {
    return jwt.verify(token, JWT_SECRET, { issuer: JWT_ISS });
  } catch (err) {
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
   Middleware: require specific roles
   - 401 if no token or invalid token
   - 403 if role is not allowed
   ============================================================ */
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

      // Attach user info to request
      req.user = payload;
      next();
    } catch (err) {
      const message = err.message || "Unauthorized";
      let status = 401;

      if (message === "Missing JWT_SECRET in environment variables") {
        status = 500;
      }

      console.error("Auth middleware error:", message);
      return res.status(status).json({ error: "Unauthorized", message });
    }
  };
}

/* ============================================================
   Shortcut exports for common roles
   ============================================================ */

// Require admin only
export const requireAdmin = requireRole("admin");

// Require staff or admin
export const requireStaffOrAdmin = requireRole("admin", "staff");
