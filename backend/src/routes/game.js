import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { addScore, updateUser } from "../services/firestoreStore.js";
import {
  calculateLevel,
  calculateXpGain,
  isValidMode,
  normalizeUser,
  updateStreak
} from "../services/progress.js";

const router = express.Router();

router.post("/submit-score", requireAuth, async (req, res) => {
  const mode = String(req.body.mode || "");
  const score = Number(req.body.score || 0);
  const accuracy = Number(req.body.accuracy || 0);
  const reactionTime = req.body.reactionTime == null ? null : Number(req.body.reactionTime);

  if (!isValidMode(mode)) return res.status(400).json({ message: "Invalid game mode." });
  if (!Number.isFinite(score) || score < 0) return res.status(400).json({ message: "Score must be a positive number." });
  if (!Number.isFinite(accuracy) || accuracy < 0 || accuracy > 100) {
    return res.status(400).json({ message: "Accuracy must be between 0 and 100." });
  }

  const xpGain = calculateXpGain({ mode, score, accuracy, reactionTime });

  const user = req.user;
  await addScore({ userId: user.id, mode, score, accuracy, reactionTime });

  user.xp += xpGain;
  user.level = calculateLevel(user.xp);
  user.totalGamesPlayed += 1;
  user.bestScores[mode] = Math.max(user.bestScores?.[mode] || 0, score);
  user.accuracy[mode] = Math.round(((user.accuracy?.[mode] || 0) + accuracy) / 2);
  updateStreak(user);
  user.recentActivity = [
    `${mode} score ${score}${mode === "reaction" && reactionTime ? ` (${reactionTime}ms)` : ""}`,
    ...(user.recentActivity || [])
  ].slice(0, 8);

  const updatedUser = await updateUser(user);
  return res.status(201).json({ xpGain, user: normalizeUser(updatedUser) });
});

export default router;
