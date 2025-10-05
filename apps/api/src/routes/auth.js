// apps/api/src/routes/auth.js
import express from "express";
import { login, getMe, logout } from "../controllers/auth.controller.js";

const router = express.Router();

// Public routes
router.post("/login", login);
router.get("/me", getMe);
router.post("/logout", logout);

export default router;
