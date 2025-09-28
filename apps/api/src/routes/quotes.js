import express from "express";
import {
  createQuote,
  getAllQuotes,
  getQuoteById,
  updateQuote,
  deleteQuote,
  updateQuoteStatus,
  getQuoteSummary,
  convertQuoteToOrder,
} from "../controllers/quote.controller.js";
import { maybeAuth } from "../middleware/maybeAuth.js";

const router = express.Router();

// ✅ Public (ลูกค้าขอใบเสนอราคา)
router.post("/", createQuote);

// ✅ Protected (staff/admin เท่านั้น)
router.get("/", maybeAuth, getAllQuotes);
router.get("/summary", maybeAuth, getQuoteSummary);
router.get("/:id", maybeAuth, getQuoteById);
router.put("/:id", maybeAuth, updateQuote);
router.delete("/:id", maybeAuth, deleteQuote);
router.patch("/:id/status", maybeAuth, updateQuoteStatus);
router.post("/:id/convert", maybeAuth, convertQuoteToOrder);

export default router;
