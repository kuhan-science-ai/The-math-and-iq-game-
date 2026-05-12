import express from "express";
import { isMongoConnected } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import Score from "../models/Score.js";
import { readDb, writeDb, createLocalId } from "../services/localStore.js";
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

  if (isMongoConnected()) {
    const user = req.user;
    await Score.create({ userId: user._id, mode, score, accuracy, reactionTime });

    user.xp += xpGain;
    user.level = calculateLevel(user.xp);
    user.totalGamesPlayed += 1;
    user.bestScores[mode] = mode === "reaction"
      ? Math.max(user.bestScores[mode] || 0, score)
      : Math.max(user.bestScores[mode] || 0, score);
    user.accuracy[mode] = Math.round(((user.accuracy[mode] || 0) + accuracy) / 2);
    updateStreak(user);
    user.recentActivity = [
      `${mode} score ${score}${mode === "reaction" && reactionTime ? ` (${reactionTime}ms)` : ""}`,
      ...(user.recentActivity || [])
    ].slice(0, 8);

    await user.save();
    return res.status(201).json({ xpGain, user: normalizeUser(user) });
  }

  const db = await readDb();
  const user = db.users.find((entry) => entry.id === req.user.id);
  if (!user) return res.status(401).json({ message: "User no longer exists." });

  db.scores.push({
    id: createLocalId(),
    userId: user.id,
    mode,
    score,
    accuracy,
    reactionTime,
    date: new Date().toISOString()
  });

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

  await writeDb(db);
  return res.status(201).json({ xpGain, user: normalizeUser(user) });
});

export default router;
