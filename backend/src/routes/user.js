import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { calculateLevel, normalizeUser } from "../services/progress.js";
import { updateUser } from "../services/firestoreStore.js";
import { rewardsForLevel } from "../services/rewards.js";

const router = express.Router();
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

router.get("/profile", requireAuth, async (req, res) => {
  res.json({ user: normalizeUser(req.user) });
});

router.post("/cheat", requireAuth, async (req, res) => {
  const code = String(req.body.code || "").trim().toLowerCase();
  const user = { ...req.user };
  const result = req.body.action
    ? applyCheatAction(user, req.body)
    : applyCheatCode(user, code);

  if (!result.ok) {
    return res.status(400).json({ message: result.message });
  }

  const updatedUser = await updateUser(user);
  return res.json({ message: result.message, user: normalizeUser(updatedUser) });
});

const xpForLevel = (level) => (clamp(level, 1, 50) - 1) * 250;

const syncFromXp = (user) => {
  user.xp = Math.max(0, Number(user.xp || 0));
  user.level = calculateLevel(user.xp);
  user.rewards = rewardsForLevel(user.level);
};

const setLevel = (user, level) => {
  user.level = clamp(Number(level), 1, 50);
  user.xp = Math.max(user.xp || 0, xpForLevel(user.level));
  user.rewards = rewardsForLevel(user.level);
};

const applyCheatAction = (user, body) => {
  const action = String(body.action || "").trim().toLowerCase();
  const value = Number(body.value);

  if (action === "set-level") {
    if (!Number.isFinite(value)) return { ok: false, message: "Enter a valid level." };
    setLevel(user, value);
    return { ok: true, message: `Level set to ${user.level}. XP aligned to ${user.xp}.` };
  }

  if (action === "set-xp") {
    if (!Number.isFinite(value)) return { ok: false, message: "Enter a valid XP value." };
    user.xp = Math.max(0, Math.round(value));
    syncFromXp(user);
    return { ok: true, message: `XP set to ${user.xp}. Level recalculated to ${user.level}.` };
  }

  if (action === "add-xp") {
    if (!Number.isFinite(value)) return { ok: false, message: "Enter a valid XP amount." };
    user.xp = Math.max(0, Math.round((user.xp || 0) + value));
    syncFromXp(user);
    return { ok: true, message: `XP changed to ${user.xp}. Level recalculated to ${user.level}.` };
  }

  return { ok: false, message: "Unknown cheat action." };
};

const applyCheatCode = (user, code) => {
  const setLevelCode = code.match(/^set-level-(\d+)$/);
  const setXp = code.match(/^set-xp-(\d+)$/);
  const addXp = code.match(/^xp\+(\d+)$/);
  const removeXp = code.match(/^xp-(\d+)$/);

  if (code === "level-up") {
    setLevel(user, (user.level || 1) + 1);
    return { ok: true, message: `Level increased to ${user.level}. XP aligned to ${user.xp}.` };
  }

  if (code === "level-down") {
    setLevel(user, (user.level || 1) - 1);
    user.xp = xpForLevel(user.level);
    return { ok: true, message: `Level decreased to ${user.level}. XP aligned to ${user.xp}.` };
  }

  if (code === "xp-up") {
    user.xp = Math.max(0, (user.xp || 0) + 250);
    syncFromXp(user);
    return { ok: true, message: `Added 250 XP. Level is now ${user.level}.` };
  }

  if (code === "xp-down") {
    user.xp = Math.max(0, (user.xp || 0) - 250);
    syncFromXp(user);
    return { ok: true, message: `Removed 250 XP. Level is now ${user.level}.` };
  }

  if (setLevelCode) {
    setLevel(user, Number(setLevelCode[1]));
    return { ok: true, message: `Level set to ${user.level}. XP aligned to ${user.xp}.` };
  }

  if (setXp) {
    user.xp = Math.max(0, Number(setXp[1]));
    syncFromXp(user);
    return { ok: true, message: `XP set to ${user.xp}. Level recalculated to ${user.level}.` };
  }

  if (addXp) {
    user.xp = Math.max(0, (user.xp || 0) + Number(addXp[1]));
    syncFromXp(user);
    return { ok: true, message: `Added ${Number(addXp[1])} XP. Level is now ${user.level}.` };
  }

  if (removeXp) {
    user.xp = Math.max(0, (user.xp || 0) - Number(removeXp[1]));
    syncFromXp(user);
    return { ok: true, message: `Removed ${Number(removeXp[1])} XP. Level is now ${user.level}.` };
  }

  return {
    ok: false,
    message: "Unknown cheat code. Try level-up, level-down, xp-up, xp-down, set-level-10, set-xp-5000, xp+1000, or xp-500."
  };
};

export default router;
