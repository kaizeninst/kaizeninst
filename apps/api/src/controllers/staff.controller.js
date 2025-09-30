import models from "../models/index.js";
import { hashPassword, verifyPassword } from "../utils/password.js";

const { Staff } = models;

// 🔹 Utility: สร้าง temporary password แบบสุ่ม
function generateTempPassword(len = 12) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  return Array.from({ length: len })
    .map(() => chars[Math.floor(Math.random() * chars.length)])
    .join("");
}

// ✅ CREATE (with temp password option)
export const createStaff = async (req, res) => {
  try {
    const { name, username, password, role, status } = req.body;

    // ถ้า admin ไม่ส่ง password มา → generate temp password
    const plainPassword = password || generateTempPassword();
    const password_hash = await hashPassword(plainPassword);

    const staff = await Staff.create({
      name,
      username,
      password_hash,
      role,
      status,
      must_change_password: true, // ต้องมี field นี้ใน DB (BOOLEAN)
    });

    res.status(201).json({
      message: "Staff created successfully",
      staff: {
        id: staff.id,
        name: staff.name,
        username: staff.username,
        role: staff.role,
        status: staff.status,
      },
      tempPassword: plainPassword, // ❗ แสดงครั้งเดียว
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ READ ALL
export const getAllStaff = async (_req, res) => {
  try {
    const staff = await Staff.findAll();
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ READ ONE
export const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) return res.status(404).json({ error: "Staff not found" });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ UPDATE
export const updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) return res.status(404).json({ error: "Staff not found" });

    const updateData = { ...req.body };
    if (req.body.password) {
      updateData.password_hash = await hashPassword(req.body.password);
      delete updateData.password;
    }

    await staff.update(updateData);
    res.json(staff);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ DELETE
export const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) return res.status(404).json({ error: "Staff not found" });

    await staff.destroy();
    res.json({ message: "Staff deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ RESET PASSWORD (admin ใช้ตอน staff ลืมรหัส)
export const resetStaffPassword = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) return res.status(404).json({ error: "Staff not found" });

    const tempPassword = generateTempPassword();
    const password_hash = await hashPassword(tempPassword);

    staff.password_hash = password_hash;
    staff.must_change_password = true; // บังคับเปลี่ยนใหม่ (optional)
    await staff.save();

    res.json({
      message: "Temporary password generated (show once)",
      tempPassword, // ❗ ส่งคืน admin ครั้งเดียว
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 CHANGE PASSWORD (staff ใช้เอง)
export const changePassword = async (req, res) => {
  try {
    const staffId = req.user?.id; // ดึงจาก JWT middleware (requireStaffOrAdmin)
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "oldPassword and newPassword are required" });
    }

    const staff = await Staff.findByPk(staffId);
    if (!staff) return res.status(404).json({ error: "Staff not found" });

    // ตรวจสอบรหัสเก่า
    const ok = await verifyPassword(oldPassword, staff.password_hash);
    if (!ok) return res.status(401).json({ error: "Old password is incorrect" });

    // hash และบันทึกรหัสใหม่
    staff.password_hash = await hashPassword(newPassword);
    staff.must_change_password = false; // ✅ ปิด flag หลังเปลี่ยนแล้ว
    await staff.save();

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("changePassword error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
