const cosmeticRewards = {
  5: ["bronze-focus-badge", "Bronze Focus Badge", "badge", "Rare", "A starter badge for locking in early consistency."],
  10: ["speed-math-reactor", "Speed Math Reactor Emblem", "emblem", "Epic", "An emblem for hitting the first double-digit level."],
  15: ["logic-streak-crown", "Logic Streak Crown", "crown", "Epic", "A crown for steady reasoning and puzzle accuracy."],
  20: ["neon-solver-frame", "Neon Solver Frame", "frame", "Legendary", "A profile frame for serious training momentum."],
  25: ["aptitude-master-card", "Aptitude Master Card", "card", "Legendary", "A collectible profile card for clearing the mid-road wall."],
  30: ["reaction-blade-trail", "Reaction Blade Trail", "trail", "Mythic", "A fast-response trail for sharper reflex work."],
  35: ["cognitive-champion-emblem", "Cognitive Champion Emblem", "emblem", "Mythic", "A high-tier emblem for advanced progression."],
  40: ["impossible-mode-crest", "Impossible Mode Crest", "crest", "Ascendant", "A crest reserved for the hardest training stretch."],
  45: ["brain-boost-elite-aura", "Brain Boost Elite Aura", "aura", "Ascendant", "A glowing aura for elite-level users."],
  50: ["level-50-grandmaster-trophy", "Level 50 Grandmaster Trophy", "trophy", "Grandmaster", "The final show-off reward for completing the full path."]
};

const minorNames = ["XP Spark", "Focus Token", "Accuracy Chip", "Logic Shard", "Speed Core", "Streak Gem"];

const rarityConfig = {
  Common: { multiplier: 1.25, minutes: 10 },
  Rare: { multiplier: 1.5, minutes: 15 },
  Epic: { multiplier: 1.75, minutes: 20 },
  Legendary: { multiplier: 2, minutes: 30 },
  Mythic: { multiplier: 2.5, minutes: 45 },
  Ascendant: { multiplier: 2.75, minutes: 60 },
  Grandmaster: { multiplier: 3, minutes: 90 }
};

const rarityForLevel = (level) => {
  if (level >= 50) return "Grandmaster";
  if (level >= 40) return "Ascendant";
  if (level >= 30) return "Mythic";
  if (level >= 20) return "Legendary";
  if (level >= 10) return "Epic";
  if (level >= 5) return "Rare";
  return "Common";
};

const tokenReward = (level) => {
  const name = minorNames[level % minorNames.length];
  return {
    id: `level-${level}-token`,
    level,
    name: `${name} ${level}`,
    type: "token",
    category: "collectible",
    rarity: rarityForLevel(level),
    description: `Unlocked for reaching Level ${level}.`
  };
};

const cosmeticReward = (level) => {
  const item = cosmeticRewards[level];
  if (!item) return null;
  const [slug, name, type, rarity, description] = item;
  return {
    id: `level-${level}-${slug}`,
    level,
    name,
    type,
    category: "cosmetic",
    rarity,
    description,
    equipSlot: type
  };
};

const multiplierReward = (level) => {
  if (level % 5 !== 0) return null;
  const rarity = rarityForLevel(level);
  const config = rarityConfig[rarity];
  return {
    id: `level-${level}-xp-multiplier`,
    level,
    name: `${config.multiplier}x XP Multiplier`,
    type: "xp_multiplier",
    category: "consumable",
    rarity,
    multiplier: config.multiplier,
    durationMinutes: config.minutes,
    description: `Use to multiply earned XP by ${config.multiplier}x for ${config.minutes} minutes.`
  };
};

const rewardsForRoadLevel = (level) => [tokenReward(level), cosmeticReward(level), multiplierReward(level)].filter(Boolean);

export const rewardPath = Array.from({ length: 49 }, (_, index) => rewardsForRoadLevel(index + 2)).flat();

export const rewardsForLevel = (level = 1) => rewardPath.filter((reward) => reward.level <= Number(level || 1));

export const rewardsBetweenLevels = (previousLevel = 1, nextLevel = 1) =>
  rewardPath.filter((reward) => reward.level > Number(previousLevel || 1) && reward.level <= Number(nextLevel || 1));

export const mergeRewards = (currentRewards = [], newRewards = []) => {
  const seen = new Set();
  return [...currentRewards, ...newRewards].filter((reward) => {
    const key = reward.id || `${reward.level}-${reward.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const findReward = (rewards = [], rewardId = "") => rewards.find((reward) => reward.id === rewardId);

export const activeBoost = (user, now = new Date()) => {
  const boost = user.activeXpBoost;
  if (!boost?.expiresAt) return null;
  return new Date(boost.expiresAt).getTime() > now.getTime() ? boost : null;
};

export const sanitizeEquippedRewards = (equippedRewards = {}, earnedRewards = []) => {
  const earnedIds = new Set(earnedRewards.filter((reward) => reward.category === "cosmetic").map((reward) => reward.id));
  return Object.fromEntries(
    Object.entries(equippedRewards || {}).filter(([, reward]) => reward?.id && earnedIds.has(reward.id))
  );
};
