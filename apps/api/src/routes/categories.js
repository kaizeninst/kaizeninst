import express from "express";
import {
  createCategory,
  getAllCategories,
  getParentCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  moveCategory,
} from "../controllers/category.controller.js";
import { maybeAuth } from "../middleware/maybeAuth.js";

const router = express.Router();

// Public
router.get("/parents", getParentCategories);
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

// Protected
router.post("/", maybeAuth, createCategory);
router.put("/:id", maybeAuth, updateCategory);
router.patch("/:id/toggle", maybeAuth, toggleCategoryStatus);
router.delete("/:id", maybeAuth, deleteCategory);
router.patch("/:id/move", maybeAuth, moveCategory);

export default router;
