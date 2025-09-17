import express from "express";
import {
  createQuote,
  getAllQuotes,
  getQuoteById,
  updateQuote,
  deleteQuote,
  updateQuoteStatus,
} from "../controllers/quote.controller.js";
import { maybeAuth } from "../middleware/maybeAuth.js";

const router = express.Router();

// ✅ Public (ลูกค้าขอใบเสนอราคา)
router.post("/", createQuote);

// ✅ Protected (staff/admin เท่านั้น)
router.get("/", maybeAuth, getAllQuotes);
router.get("/:id", maybeAuth, getQuoteById);
router.put("/:id", maybeAuth, updateQuote);
router.delete("/:id", maybeAuth, deleteQuote);
router.patch("/:id/status", maybeAuth, updateQuoteStatus);

export default router;
