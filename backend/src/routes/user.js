import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { calculateLevel, normalizeUser, xpForLevel, xpRequiredForLevelUp } from "../services/progress.js";
import { updateUser } from "../services/firestoreStore.js";
import { findReward, rewardsBetweenLevels, rewardsForLevel, sanitizeEquippedRewards } from "../services/rewards.js";

const router = express.Router();
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const MAX_LEVEL = 200;

router.get("/profile", requireAuth, async (req, res) => {
  res.json({ user: normalizeUser(req.user) });
});

router.post("/cheat", requireAuth, async (req, res) => {
  const code = String(req.body.code || "").trim().toLowerCase();
  const user = { ...req.user };
  const previousLevel = Number(user.level || 1);
  const result = req.body.action
    ? applyCheatAction(user, req.body)
    : applyCheatCode(user, code);

  if (!result.ok) {
    return res.status(400).json({ message: result.message });
  }

  const updatedUser = await updateUser(user);
  const newRewards = user.level > previousLevel ? rewardsBetweenLevels(previousLevel, user.level) : [];
  return res.json({
    message: result.message,
    leveledUp: user.level > previousLevel,
    rewardsReset: user.level < previousLevel,
    newRewards,
    user: normalizeUser(updatedUser)
  });
});

router.post("/rewards/use", requireAuth, async (req, res) => {
  const rewardId = String(req.body.rewardId || "");
  const user = { ...req.user };
  const earnedRewards = user.earnedRewards || user.rewards || rewardsForLevel(user.level || 1);
  const reward = findReward(earnedRewards, rewardId);

  if (!reward) return res.status(404).json({ message: "Reward was not found in earned rewards." });
  if (reward.category !== "consumable" || reward.type !== "xp_multiplier") {
    return res.status(400).json({ message: "Only XP multiplier rewards can be used." });
  }

  const expiresAt = new Date(Date.now() + Number(reward.durationMinutes || 10) * 60000).toISOString();
  user.activeXpBoost = {
    rewardId: reward.id,
    name: reward.name,
    multiplier: reward.multiplier,
    rarity: reward.rarity,
    startedAt: new Date().toISOString(),
    expiresAt
  };
  user.earnedRewards = earnedRewards.filter((item) => item.id !== reward.id);
  user.rewards = user.earnedRewards;
  user.recentActivity = [`Used ${reward.name}. XP boost active until ${expiresAt}.`, ...(user.recentActivity || [])].slice(0, 8);

  const updatedUser = await updateUser(user);
  return res.json({ message: `${reward.name} activated.`, activeXpBoost: user.activeXpBoost, user: normalizeUser(updatedUser) });
});

router.post("/rewards/equip", requireAuth, async (req, res) => {
  const rewardId = String(req.body.rewardId || "");
  const slot = String(req.body.slot || "");
  const user = { ...req.user };
  const earnedRewards = user.earnedRewards || user.rewards || rewardsForLevel(user.level || 1);
  const equippedRewards = { ...(user.equippedRewards || {}) };

  if (req.body.clear) {
    delete equippedRewards[slot];
    user.equippedRewards = equippedRewards;
    const updatedUser = await updateUser(user);
    return res.json({ message: "Reward slot cleared.", user: normalizeUser(updatedUser) });
  }

  const reward = findReward(earnedRewards, rewardId);
  if (!reward) return res.status(404).json({ message: "Cosmetic reward was not found in earned rewards." });
  if (reward.category !== "cosmetic") return res.status(400).json({ message: "Only cosmetic rewards can be equipped." });

  equippedRewards[reward.equipSlot || reward.type] = reward;
  user.earnedRewards = earnedRewards;
  user.rewards = earnedRewards;
  user.equippedRewards = equippedRewards;
  user.recentActivity = [`Equipped ${reward.name}.`, ...(user.recentActivity || [])].slice(0, 8);

  const updatedUser = await updateUser(user);
  return res.json({ message: `${reward.name} equipped.`, user: normalizeUser(updatedUser) });
});

const syncFromXp = (user) => {
  user.xp = Math.max(0, Number(user.xp || 0));
  user.level = calculateLevel(user.xp);
  user.earnedRewards = rewardsForLevel(user.level);
  user.rewards = user.earnedRewards;
  user.equippedRewards = sanitizeEquippedRewards(user.equippedRewards || {}, user.earnedRewards);
  user.activeXpBoost = null;
};

const setLevel = (user, level) => {
  user.level = clamp(Number(level), 1, MAX_LEVEL);
  user.xp = xpForLevel(user.level);
  user.earnedRewards = rewardsForLevel(user.level);
  user.rewards = user.earnedRewards;
  user.equippedRewards = sanitizeEquippedRewards(user.equippedRewards || {}, user.earnedRewards);
  user.activeXpBoost = null;
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
    const amount = xpRequiredForLevelUp(user.level || 1);
    user.xp = Math.max(0, (user.xp || 0) + amount);
    syncFromXp(user);
    return { ok: true, message: `Added ${amount} XP. Level is now ${user.level}.` };
  }

  if (code === "xp-down") {
    const amount = xpRequiredForLevelUp(Math.max(1, user.level || 1));
    user.xp = Math.max(0, (user.xp || 0) - amount);
    syncFromXp(user);
    return { ok: true, message: `Removed ${amount} XP. Level is now ${user.level}.` };
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
