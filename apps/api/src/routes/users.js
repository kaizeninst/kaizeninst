import { Router } from "express";
import { User } from "../models/User.js";

const router = Router();

// GET /api/users
router.get("/", async (req, res) => {
  try {
    const users = await User.findAll({ order: [["user_id", "DESC"]] });
    res.json({ data: users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/users
router.post("/", async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ error: "name and email required" });

    const user = await User.create({ name, email });
    res.status(201).json(user);
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: "Email already exists" });
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
