import { mergeRewards, rewardIds, rewardsForLevel, sanitizeEquippedRewards } from "./rewards.js";

const MODES = ["speedMath", "aptitude", "reaction", "challenge"];

export const emptyScores = () => ({
  speedMath: 0,
  aptitude: 0,
  reaction: 0,
  challenge: 0
});

const BASE_LEVEL_XP = 250;
const LEVEL_XP_GROWTH = 1.12;
const LEVEL_XP_ROUNDING = 25;

export const xpRequiredForLevelUp = (level = 1) => {
  const currentLevel = Math.max(1, Math.floor(Number(level || 1)));
  const rawRequirement = BASE_LEVEL_XP * LEVEL_XP_GROWTH ** (currentLevel - 1);
  return Math.round(rawRequirement / LEVEL_XP_ROUNDING) * LEVEL_XP_ROUNDING;
};

export const xpForLevel = (level = 1) => {
  const targetLevel = Math.min(50, Math.max(1, Math.floor(Number(level || 1))));
  let total = 0;
  for (let currentLevel = 1; currentLevel < targetLevel; currentLevel += 1) {
    total += xpRequiredForLevelUp(currentLevel);
  }
  return total;
};

export const calculateLevel = (xp) => {
  const totalXp = Math.max(0, Number(xp || 0));
  let level = 1;

  while (level < 50 && totalXp >= xpForLevel(level + 1)) {
    level += 1;
  }

  return level;
};

export const levelProgress = (xp) => {
  const totalXp = Math.max(0, Number(xp || 0));
  const level = calculateLevel(totalXp);
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = level >= 50 ? currentLevelXp : xpForLevel(level + 1);
  const required = Math.max(0, nextLevelXp - currentLevelXp);
  const progress = level >= 50 ? required : totalXp - currentLevelXp;

  return {
    level,
    progress,
    required,
    remaining: Math.max(0, required - progress),
    nextLevelXp
  };
};

export const calculateXpGain = ({ mode, score, accuracy = 0, reactionTime }) => {
  if (mode === "reaction") {
    const speedBonus = Math.max(0, 350 - Number(reactionTime || 999));
    return Math.max(10, Math.round(speedBonus / 3));
  }

  const scorePart = Math.max(0, Number(score || 0)) * 4;
  const accuracyPart = Math.round(Math.max(0, Number(accuracy || 0)) * 1.5);
  return Math.max(10, scorePart + accuracyPart);
};

export const updateStreak = (user, playedAt = new Date()) => {
  const today = playedAt.toISOString().slice(0, 10);
  const last = user.lastPlayedDate;

  if (!last) {
    user.streak = 1;
  } else if (last !== today) {
    const previous = new Date(`${last}T00:00:00.000Z`);
    const current = new Date(`${today}T00:00:00.000Z`);
    const diffDays = Math.round((current - previous) / 86400000);
    user.streak = diffDays === 1 ? (user.streak || 0) + 1 : 1;
  }

  user.lastPlayedDate = today;
};

export const normalizeUser = (user) => {
  const obj = typeof user.toObject === "function" ? user.toObject() : { ...user };
  const xp = obj.xp || 0;
  const progress = levelProgress(xp);
  const existingRewards = (obj.earnedRewards || obj.rewards || []).filter((reward) => reward.type !== "shard" || rewardIds.has(reward.id));
  const collectibleBackfill = rewardsForLevel(progress.level).filter((reward) => reward.category !== "consumable");
  const earnedRewards = mergeRewards(collectibleBackfill, existingRewards);
  const equippedRewards = sanitizeEquippedRewards(obj.equippedRewards || {}, earnedRewards);
  const activeXpBoost = obj.activeXpBoost?.expiresAt && new Date(obj.activeXpBoost.expiresAt).getTime() > Date.now()
    ? obj.activeXpBoost
    : null;

  return {
    id: String(obj._id || obj.id),
    name: obj.name,
    email: obj.email,
    xp,
    level: progress.level,
    xpProgress: progress,
    streak: obj.streak || 0,
    bestScores: { ...emptyScores(), ...(obj.bestScores || {}) },
    accuracy: { ...emptyScores(), ...(obj.accuracy || {}) },
    totalGamesPlayed: obj.totalGamesPlayed || 0,
    recentActivity: obj.recentActivity || [],
    earnedRewards,
    rewards: earnedRewards,
    equippedRewards,
    activeXpBoost
  };
};

export const isValidMode = (mode) => MODES.includes(mode);
