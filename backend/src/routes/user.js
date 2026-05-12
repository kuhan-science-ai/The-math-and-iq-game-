import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { normalizeUser } from "../services/progress.js";

const router = express.Router();

router.get("/profile", requireAuth, async (req, res) => {
  res.json({ user: normalizeUser(req.user) });
});

export default router;
