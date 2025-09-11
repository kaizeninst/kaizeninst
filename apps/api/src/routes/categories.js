import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { maybeAuth } from "../middleware/maybeAuth.js";

const router = express.Router();

// Public
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

// Protected
router.post("/", maybeAuth, createCategory);
router.put("/:id", maybeAuth, updateCategory);
router.delete("/:id", maybeAuth, deleteCategory);

export default router;
