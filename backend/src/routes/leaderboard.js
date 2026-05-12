import express from "express";
import { getLeaderboard } from "../services/firestoreStore.js";
import { isValidMode } from "../services/progress.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const mode = req.query.mode ? String(req.query.mode) : "";
  if (mode && !isValidMode(mode)) return res.status(400).json({ message: "Invalid leaderboard mode." });

  return res.json({ leaderboard: await getLeaderboard(mode) });
});

export default router;
