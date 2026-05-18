import express from "express";
import bcrypt from "bcryptjs";
import { getAuth } from "firebase-admin/auth";
import {
  createUser,
  findUserByEmail,
  findUserByFirebaseUid,
  updateUser
} from "../services/firestoreStore.js";
import { normalizeUser } from "../services/progress.js";
import { signToken } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

const validEmail = (email = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

router.post("/register", asyncHandler(async (req, res) => {
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
}));

router.post("/login", asyncHandler(async (req, res) => {
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
}));

router.post("/google", asyncHandler(async (req, res) => {
  const firebaseToken = String(req.body.firebaseToken || "");
  const name = String(req.body.name || req.body.username || "").trim();

  if (!firebaseToken) {
    return res.status(400).json({ message: "Firebase token required." });
  }

  let decoded;
  try {
    decoded = await getAuth().verifyIdToken(firebaseToken);
  } catch (err) {
    console.error("Google sign-in token verification failed:", err.code || err.message);
    return res.status(401).json({
      message: "Google sign-in token is invalid. Check that frontend Firebase config and backend service account use the same Firebase project."
    });
  }
  const email = String(decoded.email || "").toLowerCase();

  if (!decoded.uid || !validEmail(email)) {
    return res.status(400).json({ message: "Google account must include a verified email." });
  }

  const existingByUid = await findUserByFirebaseUid(decoded.uid);
  if (existingByUid) {
    return res.json({ token: signToken(existingByUid.id), user: normalizeUser(existingByUid) });
  }

  const existingByEmail = await findUserByEmail(email);
  if (existingByEmail) {
    const linkedUser = await updateUser({
      ...existingByEmail,
      authProvider: existingByEmail.authProvider === "local" ? "local+google" : "google",
      firebaseUid: decoded.uid
    });

    return res.json({ token: signToken(linkedUser.id), user: normalizeUser(linkedUser) });
  }

  if (name.length < 2) {
    return res.status(202).json({
      needsUsername: true,
      email,
      suggestedName: decoded.name || email.split("@")[0]
    });
  }

  const passwordHash = await bcrypt.hash(`google:${decoded.uid}:${process.env.JWT_SECRET || "dev"}`, 12);
  const user = await createUser({
    name,
    email,
    password: passwordHash,
    authProvider: "google",
    firebaseUid: decoded.uid
  });

  return res.status(201).json({ token: signToken(user.id), user: normalizeUser(user) });
}));

export default router;
