import express from "express";
import { isMongoConnected } from "../config/db.js";
import Score from "../models/Score.js";
import User from "../models/User.js";
import { readDb } from "../services/localStore.js";
import { isValidMode } from "../services/progress.js";

const router = express.Router();

const rankLocal = (db, mode) => {
  const bestByUser = new Map();
  db.scores
    .filter((score) => !mode || score.mode === mode)
    .forEach((score) => {
      const current = bestByUser.get(score.userId);
      if (!current || score.score > current.score) bestByUser.set(score.userId, score);
    });

  return Array.from(bestByUser.values())
    .map((score) => {
      const user = db.users.find((entry) => entry.id === score.userId);
      return {
        userId: score.userId,
        name: user?.name || "Unknown",
        mode: score.mode,
        score: score.score,
        accuracy: score.accuracy,
        reactionTime: score.reactionTime,
        date: score.date
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
};

router.get("/", async (req, res) => {
  const mode = req.query.mode ? String(req.query.mode) : "";
  if (mode && !isValidMode(mode)) return res.status(400).json({ message: "Invalid leaderboard mode." });

  if (isMongoConnected()) {
    const scores = await Score.aggregate([
      ...(mode ? [{ $match: { mode } }] : []),
      { $sort: { score: -1, date: 1 } },
      {
        $group: {
          _id: "$userId",
          score: { $first: "$score" },
          mode: { $first: "$mode" },
          accuracy: { $first: "$accuracy" },
          reactionTime: { $first: "$reactionTime" },
          date: { $first: "$date" }
        }
      },
      { $sort: { score: -1 } },
      { $limit: 20 }
    ]);

    const users = await User.find({ _id: { $in: scores.map((entry) => entry._id) } }).select("name");
    const userMap = new Map(users.map((user) => [user._id.toString(), user.name]));

    return res.json({
      leaderboard: scores.map((entry) => ({
        userId: entry._id.toString(),
        name: userMap.get(entry._id.toString()) || "Unknown",
        mode: entry.mode,
        score: entry.score,
        accuracy: entry.accuracy,
        reactionTime: entry.reactionTime,
        date: entry.date
      }))
    });
  }

  const db = await readDb();
  return res.json({ leaderboard: rankLocal(db, mode) });
});

export default router;
