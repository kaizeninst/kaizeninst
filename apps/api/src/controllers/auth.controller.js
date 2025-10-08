// apps/api/src/controllers/auth.controller.js
import models from "../models/index.js";
import { verifyPassword } from "../utils/password.js";
import { signAdminToken } from "../utils/jwt.js";

const { Staff } = models;

/**
 * ✅ LOGIN (POST /api/auth/login)
 * ตรวจสอบ username / password → ออก JWT token (มี must_change_password)
 */
export const login = async (req, res) => {
  try {
    const { username = "", password = "" } = req.body || {};

    // 🔹 ตรวจว่ากรอกครบไหม
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    // 🔹 หา staff จากฐานข้อมูล
    const staff = await Staff.findOne({ where: { username } });
    if (!staff) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 🔹 ตรวจสถานะ (ต้อง active และเป็น role ที่อนุญาต)
    if (staff.status !== "active" || !["admin", "staff"].includes(staff.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // 🔹 ตรวจรหัสผ่าน
    const passwordOk = await verifyPassword(password, staff.password_hash || "");
    if (!passwordOk) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 🔹 โหลดข้อมูลล่าสุดจากฐานข้อมูล (เผื่อเพิ่ง reset password)
    await staff.reload();

    // 🔹 สร้าง JWT พร้อม flag must_change_password
    const token = signAdminToken(staff);

    // 🔹 เซ็ต cookie (httpOnly)
    res.cookie("accessToken", token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24, // 1 วัน
      path: "/",
    });

    // 🔹 อัปเดตเวลา last_login
    staff.last_login = new Date();
    await staff.save();

    // 🔹 ส่ง response กลับ
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
  } catch (err) {
    console.error("POST /api/auth/login error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * ✅ ME (GET /api/auth/me)
 * ใช้ตรวจสอบ JWT ใน cookie / header
 */
export const getMe = (req, res) => {
  try {
    // 🔹 ดึง token จาก cookie หรือ header
    const accessToken =
      req.cookies?.accessToken || req.headers.authorization?.replace(/^Bearer\s+/i, "");

    if (!accessToken) {
      return res.status(200).json({ authenticated: false });
    }

    // 🔹 ถอดรหัส JWT (อ่าน payload)
    const base64 = accessToken.split(".")[1];
    const payload = JSON.parse(Buffer.from(base64, "base64").toString("utf8") || "{}");

    return res.json({
      authenticated: true,
      user: payload,
    });
  } catch {
    return res.json({ authenticated: false });
  }
};

/**
 * ✅ LOGOUT (POST /api/auth/logout)
 * เคลียร์ cookie accessToken ออกจาก browser
 */
export const logout = (req, res) => {
  res.clearCookie("accessToken", {
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return res.json({ message: "Logged out successfully" });
};
