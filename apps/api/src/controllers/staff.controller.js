// ============================================================
//  STAFF CONTROLLER
// ============================================================

import models from "../models/index.js";
import { Op } from "sequelize";
import { hashPassword, verifyPassword } from "../utils/password.js";

const { Staff } = models;

/* ============================================================
   UTILITY: Generate temporary password
   ============================================================ */
function generateTempPassword(length = 12) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  return Array.from({ length })
    .map(() => chars[Math.floor(Math.random() * chars.length)])
    .join("");
}

/* ============================================================
   CREATE STAFF (POST /api/staff)
   - Generate temporary password if not provided
   ============================================================ */
export const createStaff = async (req, res) => {
  try {
    const { name, username, password, role, status } = req.body;

    const plainPassword = password || generateTempPassword();
    const password_hash = await hashPassword(plainPassword);

    const staff = await Staff.create({
      name,
      username,
      password_hash,
      role,
      status,
      must_change_password: true,
    });

    return res.status(201).json({
      message: "Staff created successfully",
      staff: {
        id: staff.id,
        name: staff.name,
        username: staff.username,
        role: staff.role,
        status: staff.status,
      },
      tempPassword: plainPassword, // Show once only
    });
  } catch (error) {
    console.error("POST /api/staff error:", error);
    return res.status(400).json({ error: error.message });
  }
};

/* ============================================================
   GET ALL STAFF (GET /api/staff)
   Support pagination, filters by role/status/search
   ============================================================ */
export const getAllStaff = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { role, status, search } = req.query;

    const where = {};
    if (role) where.role = role;
    if (status) where.status = status;

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Staff.findAndCountAll({
      where,
      offset,
      limit,
      order: [["created_at", "DESC"]],
    });

    return res.json({
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/staff error:", error);
    return res.status(500).json({ error: error.message });
  }
};

/* ============================================================
   GET STAFF BY ID (GET /api/staff/:id)
   ============================================================ */
export const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) return res.status(404).json({ error: "Staff not found" });
    return res.json(staff);
  } catch (error) {
    console.error("GET /api/staff/:id error:", error);
    return res.status(500).json({ error: error.message });
  }
};

/* ============================================================
   UPDATE STAFF (PUT /api/staff/:id)
   - Hash password if provided
   ============================================================ */
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
    return res.json(staff);
  } catch (error) {
    console.error("PUT /api/staff/:id error:", error);
    return res.status(400).json({ error: error.message });
  }
};

/* ============================================================
   DELETE STAFF (DELETE /api/staff/:id)
   ============================================================ */
export const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) return res.status(404).json({ error: "Staff not found" });

    await staff.destroy();
    return res.json({ message: "Staff deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/staff/:id error:", error);
    return res.status(500).json({ error: error.message });
  }
};

/* ============================================================
   RESET PASSWORD (PATCH /api/staff/:id/reset)
   Admin resets staff password (generate new temporary password)
   ============================================================ */
export const resetStaffPassword = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) return res.status(404).json({ error: "Staff not found" });

    const tempPassword = generateTempPassword();
    const password_hash = await hashPassword(tempPassword);

    staff.password_hash = password_hash;
    staff.must_change_password = true;
    await staff.save();

    return res.json({
      message: "Temporary password generated (display once)",
      tempPassword,
    });
  } catch (error) {
    console.error("PATCH /api/staff/:id/reset error:", error);
    return res.status(500).json({ error: error.message });
  }
};

/* ============================================================
   CHANGE PASSWORD (PATCH /api/staff/change-password)
   Used by staff (requires JWT)
   ============================================================ */
export const changePassword = async (req, res) => {
  try {
    const staffId = req.user?.id; // Extracted from JWT
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "oldPassword and newPassword are required" });
    }

    const staff = await Staff.findByPk(staffId);
    if (!staff) return res.status(404).json({ error: "Staff not found" });

    // Verify old password
    const match = await verifyPassword(oldPassword, staff.password_hash);
    if (!match) return res.status(401).json({ error: "Old password is incorrect" });

    // Update new password
    staff.password_hash = await hashPassword(newPassword);
    staff.must_change_password = false;
    await staff.save();

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("PATCH /api/staff/change-password error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
