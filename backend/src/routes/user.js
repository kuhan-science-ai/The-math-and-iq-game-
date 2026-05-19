import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { normalizeUser } from "../services/progress.js";
import { updateUser } from "../services/firestoreStore.js";

const router = express.Router();
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

router.get("/profile", requireAuth, async (req, res) => {
  res.json({ user: normalizeUser(req.user) });
});

router.post("/cheat", requireAuth, async (req, res) => {
  const code = String(req.body.code || "").trim().toLowerCase();
  const user = { ...req.user };
  const result = applyCheatCode(user, code);

  if (!result.ok) {
    return res.status(400).json({ message: result.message });
  }

  const updatedUser = await updateUser(user);
  return res.json({ message: result.message, user: normalizeUser(updatedUser) });
});

const applyCheatCode = (user, code) => {
  const setLevel = code.match(/^set-level-(\d+)$/);
  const setXp = code.match(/^set-xp-(\d+)$/);
  const addXp = code.match(/^xp\+(\d+)$/);
  const removeXp = code.match(/^xp-(\d+)$/);

  if (code === "level-up") {
    user.level = clamp((user.level || 1) + 1, 1, 50);
    return { ok: true, message: `Level increased to ${user.level}.` };
  }

  if (code === "level-down") {
    user.level = clamp((user.level || 1) - 1, 1, 50);
    return { ok: true, message: `Level decreased to ${user.level}.` };
  }

  if (code === "xp-up") {
    user.xp = Math.max(0, (user.xp || 0) + 250);
    return { ok: true, message: "Added 250 XP." };
  }

  if (code === "xp-down") {
    user.xp = Math.max(0, (user.xp || 0) - 250);
    return { ok: true, message: "Removed 250 XP." };
  }

  if (setLevel) {
    user.level = clamp(Number(setLevel[1]), 1, 50);
    return { ok: true, message: `Level set to ${user.level}.` };
  }

  if (setXp) {
    user.xp = Math.max(0, Number(setXp[1]));
    return { ok: true, message: `XP set to ${user.xp}.` };
  }

  if (addXp) {
    user.xp = Math.max(0, (user.xp || 0) + Number(addXp[1]));
    return { ok: true, message: `Added ${Number(addXp[1])} XP.` };
  }

  if (removeXp) {
    user.xp = Math.max(0, (user.xp || 0) - Number(removeXp[1]));
    return { ok: true, message: `Removed ${Number(removeXp[1])} XP.` };
  }

  return {
    ok: false,
    message: "Unknown cheat code. Try level-up, level-down, xp-up, xp-down, set-level-10, set-xp-5000, xp+1000, or xp-500."
  };
};

export default router;
