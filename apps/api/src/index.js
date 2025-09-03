// apps/api/src/index.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";

const app = express();

// Security headers
app.use(helmet());

// JSON body
app.use(express.json());

// CORS (ถ้าเรียกผ่าน rewrite อาจไม่จำเป็น แต่กันพลาดไว้)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

// Health check
app.get("/health", (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// Example API
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Express API" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
