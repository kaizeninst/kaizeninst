// apps/api/src/index.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { testConnection, sequelize } from "./db/sequelize.js";

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
app.get("/health", async (_req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ ok: true, db: true });
  } catch {
    res.json({ ok: true, db: false });
  }
});

// Example API
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Express API" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  await testConnection();
  // sync model กับ table (ถ้า table ไม่มี มันจะสร้างให้)
  await sequelize.sync();
  console.log(`🚀 API listening on http://localhost:${PORT}`);
});
