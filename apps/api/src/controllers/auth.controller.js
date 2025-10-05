// apps/api/src/controllers/auth.controller.js
import models from "../models/index.js";
import { verifyPassword } from "../utils/password.js";
import { signAdminToken } from "../utils/jwt.js";

// ✅ POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { username = "", password = "" } = req.body || {};
    if (!username || !password)
      return res.status(400).json({ error: "username and password are required" });

    const staff = await models.Staff.findOne({ where: { username } });
    if (!staff) return res.status(401).json({ error: "Invalid credentials" });

    // ต้องเป็น active + role admin หรือ staff
    if (staff.status !== "active" || (staff.role !== "admin" && staff.role !== "staff")) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const ok = await verifyPassword(password, staff.password_hash || "");
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    // สร้าง JWT
    const token = signAdminToken({ id: staff.id, username: staff.username, role: staff.role });

    // set httpOnly cookie
    res.cookie("accessToken", token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24,
      path: "/",
    });

    // update last login
    staff.last_login = new Date();
    await staff.save();

    return res.json({
      message: "Login success",
      user: { id: staff.id, username: staff.username, name: staff.name, role: staff.role },
    });
  } catch (err) {
    console.error("POST /api/auth/login error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ GET /api/auth/me
export const getMe = (req, res) => {
  try {
    const accessToken =
      req.cookies?.accessToken || req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!accessToken) return res.status(200).json({ authenticated: false });

    const base64 = accessToken.split(".")[1];
    const payload = JSON.parse(Buffer.from(base64, "base64").toString("utf8") || "{}");

    return res.json({ authenticated: true, user: payload });
  } catch {
    return res.json({ authenticated: false });
  }
};

// ✅ POST /api/auth/logout
export const logout = (req, res) => {
  res.clearCookie("accessToken", {
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return res.json({ message: "Logged out" });
};
