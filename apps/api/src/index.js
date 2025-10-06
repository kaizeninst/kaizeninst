// apps/api/src/index.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";

import { testConnection, sequelize } from "./db/sequelize.js";
import authRoute from "./routes/auth.js";
import categoryRoutes from "./routes/categories.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import quoteRoutes from "./routes/quotes.js";
import staffRoutes from "./routes/staff.js";

const app = express();

// Trust proxy (for cookies / HTTPS header forwarding)
app.set("trust proxy", 1);

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Body parsers
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Cookie parser
app.use(cookieParser());

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000"],
    credentials: true,
  })
);

// Serve uploaded images (local dev mode only)
if (process.env.STORAGE_MODE === "local") {
  const uploadsDir = path.join(process.cwd(), "public/uploads");
  app.use("/uploads", express.static(uploadsDir));
  console.log("📁 Serving local uploads from:", uploadsDir);
}

// Health check
app.get("/health", async (_req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ ok: true, db: true });
  } catch {
    res.json({ ok: true, db: false });
  }
});

// API Routes
app.use("/api/auth", authRoute);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/staff", staffRoutes);

// 404 handler for API routes
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Not found" });
  }
  next();
});

// Global error handler
app.use((err, _req, res, next) => {
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON" });
  }
  console.error("❌ Server Error:", err);
  return res.status(500).json({ error: "Internal server error" });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  await testConnection();
  await sequelize.sync(); // sync models automatically (dev only)
  console.log(`🚀 API listening on http://localhost:${PORT}`);
});
