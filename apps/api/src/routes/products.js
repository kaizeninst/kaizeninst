import express from "express";
import multer from "multer";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  getProductsBulk,
  uploadProductImage,
} from "../controllers/product.controller.js";
import { maybeAuth } from "../middleware/maybeAuth.js";

const router = express.Router();
const upload = multer({ dest: "tmp/" });

// Public
router.get("/", getAllProducts);
router.post("/bulk", getProductsBulk);
router.get("/:id", getProductById);

// Protected
router.post("/", maybeAuth, createProduct);
router.put("/:id", maybeAuth, updateProduct);
router.delete("/:id", maybeAuth, deleteProduct);
router.patch("/:id/toggle", maybeAuth, toggleProductStatus);
router.post("/upload", maybeAuth, upload.single("file"), uploadProductImage);

export default router;
