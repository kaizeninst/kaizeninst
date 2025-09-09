// apps/api/src/index.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { testConnection, sequelize } from "./db/sequelize.js";
import authRoute from "./routes/auth.js";

const app = express();

// If behind a reverse proxy (e.g., Nginx, Render, Railway), enable this.
// It helps secure cookies work correctly with HTTPS.
// app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// Parse JSON body
app.use(express.json());

// Parse cookies (for httpOnly JWT cookie)
app.use(cookieParser());

// CORS (allow credentials so browser can send cookies)
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

// Routes
app.use("/api/auth", authRoute);

const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  await testConnection();
  // sync model กับ table (ถ้าไม่มี มันจะสร้างให้ตาม model)
  await sequelize.sync();
  console.log(`🚀 API listening on http://localhost:${PORT}`);
});
