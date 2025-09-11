import express from "express";
import {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
} from "../controllers/staff.controller.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Protected: admin only
router.get("/", requireAdmin, getAllStaff);
router.get("/:id", requireAdmin, getStaffById);
router.post("/", requireAdmin, createStaff);
router.put("/:id", requireAdmin, updateStaff);
router.delete("/:id", requireAdmin, deleteStaff);

export default router;
