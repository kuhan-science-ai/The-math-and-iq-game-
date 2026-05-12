import express from "express";
import bcrypt from "bcryptjs";
import { createUser, findUserByEmail } from "../services/firestoreStore.js";
import { normalizeUser } from "../services/progress.js";
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
  const existing = await findUserByEmail(email);
  if (existing) return res.status(409).json({ message: "Email is already registered." });

  const user = await createUser({ name, email, password: passwordHash });
  return res.status(201).json({ token: signToken(user.id), user: normalizeUser(user) });
});

router.post("/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!validEmail(email) || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const user = await findUserByEmail(email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  return res.json({ token: signToken(user.id), user: normalizeUser(user) });
});

export default router;
