import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} from "../controllers/order.controller.js";
import { maybeAuth } from "../middleware/maybeAuth.js";

const router = express.Router();

// Public (เช่น ลูกค้าสั่ง order)
router.post("/", createOrder);

// Protected (staff/admin เท่านั้น)
router.get("/", maybeAuth, getAllOrders);
router.get("/:id", maybeAuth, getOrderById);
router.put("/:id", maybeAuth, updateOrder);
router.delete("/:id", maybeAuth, deleteOrder);

export default router;
