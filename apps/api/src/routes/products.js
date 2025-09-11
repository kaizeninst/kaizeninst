import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import { maybeAuth } from "../middleware/maybeAuth.js";

const router = express.Router();

// Public
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Protected
router.post("/", maybeAuth, createProduct);
router.put("/:id", maybeAuth, updateProduct);
router.delete("/:id", maybeAuth, deleteProduct);

export default router;
