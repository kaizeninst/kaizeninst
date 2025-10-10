// ============================================================
//  AUTH CONTROLLER
// ============================================================

import models from "../models/index.js";
import { verifyPassword } from "../utils/password.js";
import { signAdminToken } from "../utils/jwt.js";

const { Staff } = models;

/* ============================================================
   LOGIN (POST /api/auth/login)
   Validate credentials → issue JWT token (include must_change_password flag)
   ============================================================ */
export const login = async (req, res) => {
  try {
    const { username = "", password = "" } = req.body || {};

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    // Find staff record
    const staff = await Staff.findOne({ where: { username } });
    if (!staff) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check account status and allowed roles
    if (staff.status !== "active" || !["admin", "staff"].includes(staff.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Verify password hash
    const passwordOk = await verifyPassword(password, staff.password_hash || "");
    if (!passwordOk) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Reload in case of password reset
    await staff.reload();

    // Generate JWT token
    const token = signAdminToken(staff);

    // Set cookie
    res.cookie("accessToken", token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      path: "/",
    });

    // Update last login
    staff.last_login = new Date();
    await staff.save();

    // Response
    return res.json({
      message: "Login success",
      user: {
        id: staff.id,
        username: staff.username,
        name: staff.name,
        role: staff.role,
        must_change_password: staff.must_change_password,
      },
    });
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/* ============================================================
   ME (GET /api/auth/me)
   Verify JWT from cookie or Authorization header
   ============================================================ */
export const getMe = (req, res) => {
  try {
    const accessToken =
      req.cookies?.accessToken || req.headers.authorization?.replace(/^Bearer\s+/i, "");

    if (!accessToken) {
      return res.status(200).json({ authenticated: false });
    }

    // Decode JWT payload (non-verified, only for info)
    const base64 = accessToken.split(".")[1];
    const payload = JSON.parse(Buffer.from(base64, "base64").toString("utf8") || "{}");

    return res.json({
      authenticated: true,
      user: payload,
    });
  } catch (error) {
    console.error("GET /api/auth/me error:", error);
    return res.json({ authenticated: false });
  }
};

/* ============================================================
   LOGOUT (POST /api/auth/logout)
   Clear accessToken cookie from browser
   ============================================================ */
export const logout = (req, res) => {
  res.clearCookie("accessToken", {
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return res.json({ message: "Logged out successfully" });
};
