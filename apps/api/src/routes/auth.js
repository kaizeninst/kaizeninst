import { Router } from "express";
import models from "../models/index.js";
import { verifyPassword } from "../utils/password.js";
import { signAdminToken } from "../utils/jwt.js";

const router = Router();

// POST /api/auth/login
// body: { username, password }
router.post("/login", async (req, res) => {
  try {
    const { username = "", password = "" } = req.body || {};
    if (!username || !password)
      return res.status(400).json({ error: "username and password are required" });

    const staff = await models.Staff.findOne({ where: { username } });
    if (!staff) return res.status(401).json({ error: "Invalid credentials" });

    // ต้องเป็น active + role admin หรือ staff ถึงจะเข้าได้
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
      sameSite: "lax", // ถ้า cross-site อาจใช้ 'none' + secure:true
      secure: false, // โปรดตั้ง true ใน production (HTTPS)
      maxAge: 1000 * 60 * 60 * 24, // sync กับ JWT_EXPIRES ถ้าต้องการ
    });

    // อัปเดต last_login (optional)
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
});

// GET /api/auth/me (ตรวจว่า token ยังใช้ได้ไหม)
router.get("/me", (req, res) => {
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
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.clearCookie("accessToken");
  return res.json({ message: "Logged out" });
});

export default router;
