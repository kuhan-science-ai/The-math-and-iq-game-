import express from "express";
import bcrypt from "bcryptjs";
import { isMongoConnected } from "../config/db.js";
import User from "../models/User.js";
import { createLocalId, readDb, writeDb } from "../services/localStore.js";
import { emptyScores, normalizeUser } from "../services/progress.js";
import { signToken } from "../middleware/auth.js";

const router = express.Router();

const validEmail = (email = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

router.post("/register", async (req, res) => {
  const name = String(req.body.name || req.body.username || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (name.length < 2) return res.status(400).json({ message: "Name must be at least 2 characters." });
  if (!validEmail(email)) return res.status(400).json({ message: "Enter a valid email address." });
  if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters." });

  const passwordHash = await bcrypt.hash(password, 12);

  if (isMongoConnected()) {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email is already registered." });

    const user = await User.create({
      name,
      email,
      password: passwordHash,
      bestScores: emptyScores(),
      accuracy: emptyScores()
    });

    return res.status(201).json({ token: signToken(user._id.toString()), user: normalizeUser(user) });
  }

  const db = await readDb();
  if (db.users.some((user) => user.email === email)) {
    return res.status(409).json({ message: "Email is already registered." });
  }

  const user = {
    id: createLocalId(),
    name,
    email,
    password: passwordHash,
    xp: 0,
    level: 1,
    streak: 0,
    lastPlayedDate: null,
    bestScores: emptyScores(),
    accuracy: emptyScores(),
    totalGamesPlayed: 0,
    recentActivity: [],
    createdAt: new Date().toISOString()
  };

  db.users.push(user);
  await writeDb(db);

  return res.status(201).json({ token: signToken(user.id), user: normalizeUser(user) });
});

router.post("/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!validEmail(email) || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const user = isMongoConnected()
    ? await User.findOne({ email })
    : (await readDb()).users.find((entry) => entry.email === email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  return res.json({ token: signToken(String(user._id || user.id)), user: normalizeUser(user) });
});

export default router;
