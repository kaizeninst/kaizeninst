import express from "express";
import {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  resetStaffPassword,
  changePassword,
} from "../controllers/staff.controller.js";
import { requireAdmin, requireStaffOrAdmin } from "../middleware/auth.js";
import { maybeAuth } from "../middleware/maybeAuth.js";

const router = express.Router();

// Admin only
router.get("/", requireAdmin, getAllStaff);
router.get("/:id", requireAdmin, getStaffById);
router.post("/", requireAdmin, createStaff);
router.put("/:id", requireAdmin, updateStaff);
router.delete("/:id", requireAdmin, deleteStaff);
router.post("/:id/reset-password", requireAdmin, resetStaffPassword);

// Staff or Admin can change their own password
router.post("/change-password", requireStaffOrAdmin, changePassword);

export default router;
