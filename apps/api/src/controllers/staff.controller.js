import models from "../models/index.js";
import { hashPassword } from "../utils/password.js";
const { Staff } = models;

// ✅ CREATE
export const createStaff = async (req, res) => {
  try {
    const { name, username, password, role, status } = req.body;
    const password_hash = await hashPassword(password);

    const staff = await Staff.create({ name, username, password_hash, role, status });
    res.status(201).json(staff);
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
