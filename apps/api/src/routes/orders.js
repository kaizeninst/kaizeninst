import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getOrderSummary,
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

export default router;
