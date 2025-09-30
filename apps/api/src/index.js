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

// Security headers
app.use(helmet());

// Parse JSON body
app.use(express.json());

// Parse cookies (for httpOnly JWT cookie)
app.use(cookieParser());

// CORS
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
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/staff", staffRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  await testConnection();
  await sequelize.sync(); // sync model กับ table
  console.log(`🚀 API listening on http://localhost:${PORT}`);
});
