import express from "express";
import rateLimit from "express-rate-limit";
import { sendContactEmail } from "../controllers/email.controller.js";

const router = express.Router();

// จำกัดไม่ให้ยิงเกิน 5 ครั้งต่อ 15 นาที
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many requests. Please try again later." },
});

router.post("/contact", limiter, sendContactEmail);

export default router;
