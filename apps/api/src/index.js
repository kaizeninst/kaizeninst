// apps/api/src/index.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { testConnection, sequelize } from "./db/sequelize.js";
import authRoute from "./routes/auth.js";
import categoryRoutes from "./routes/categories.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import quoteRoutes from "./routes/quotes.js";
import staffRoutes from "./routes/staff.js";

const app = express();

// If running behind a proxy/load balancer (Nginx, Cloudflare, Vercel, etc.)
app.set("trust proxy", 1);

// Security headers (tweak to play well with CORS)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Body parsers
app.use(express.json({ limit: "1mb" })); // parse JSON with a safe limit
app.use(express.urlencoded({ extended: true, limit: "1mb" })); // parse HTML form bodies

// Parse cookies (for httpOnly JWT cookie)
app.use(cookieParser());

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000"],
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

// API routes
app.use("/api/auth", authRoute);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes); // includes GET /, GET /:id, POST /bulk, etc.
app.use("/api/orders", orderRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/staff", staffRoutes);

// 404 for unknown routes
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Not found" });
  }
  next();
});

// Handle invalid JSON body (e.g., malformed JSON)
app.use((err, _req, res, next) => {
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON" });
  }
  // generic error fallback
  if (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
  next();
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  await testConnection();
  await sequelize.sync(); // ensure models are in sync
  console.log(`🚀 API listening on http://localhost:${PORT}`);
});
