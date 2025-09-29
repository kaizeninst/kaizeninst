import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getOrderSummary,
  updateOrderStatus,
  updatePaymentStatus,
} from "../controllers/order.controller.js";
import { maybeAuth } from "../middleware/maybeAuth.js";

const router = express.Router();

// Public (ลูกค้าสามารถสั่ง order ได้)
router.post("/", createOrder);

// Protected (staff/admin เท่านั้น)
router.get("/", maybeAuth, getAllOrders);
router.get("/summary", maybeAuth, getOrderSummary);
router.get("/:id", maybeAuth, getOrderById);
router.put("/:id", maybeAuth, updateOrder);
router.delete("/:id", maybeAuth, deleteOrder);
router.patch("/:id/status", maybeAuth, updateOrderStatus);
router.patch("/:id/payment", maybeAuth, updatePaymentStatus);

export default router;
