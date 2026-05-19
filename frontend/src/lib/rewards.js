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

const milestoneShards = {
  5: ["sigma-sapphire-shard", "Sigma Sapphire Shard", "Blue", "Sigma", "Σ"],
  10: ["plus-ruby-shard", "Plus Ruby Shard", "Red", "Addition", "+"],
  15: ["radical-emerald-shard", "Radical Emerald Shard", "Green", "Radicals", "√"],
  20: ["pi-amethyst-shard", "Pi Amethyst Shard", "Purple", "Pi", "π"],
  25: ["power-topaz-shard", "Power Topaz Shard", "Gold", "Powers", "x²"],
  30: ["sigma-sapphire-prism", "Sigma Sapphire Prism", "Blue", "Advanced sums", "Σ"],
  35: ["plus-ruby-prism", "Plus Ruby Prism", "Red", "Rapid arithmetic", "+"],
  40: ["radical-emerald-prism", "Radical Emerald Prism", "Green", "Root mastery", "√"],
  45: ["pi-amethyst-prism", "Pi Amethyst Prism", "Purple", "Pattern mastery", "π"],
  50: ["power-topaz-prism", "Power Topaz Prism", "Gold", "Grandmaster powers", "x²"]
};

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

const shardReward = (level) => {
  const shard = milestoneShards[level];
  if (!shard) return null;
  const [slug, name, color, theme, symbol] = shard;
  return {
    id: `level-${level}-${slug}`,
    level,
    name,
    type: "shard",
    category: "collectible",
    rarity: rarityForLevel(level),
    color,
    symbol,
    description: `${color} math shard earned at Level ${level} for ${theme}.`
  };
};

const rewardsForRoadLevel = (level) => [tokenReward(level), shardReward(level), cosmeticReward(level), multiplierReward(level)].filter(Boolean);

export const rewardPath = Array.from({ length: 49 }, (_, index) => rewardsForRoadLevel(index + 2)).flat();

export const rewardCountForLevel = (level = 1) => rewardPath.filter((reward) => reward.level <= Number(level || 1)).length;

export const activeBoostLabel = (boost) => {
  if (!boost?.expiresAt) return "No active boost";
  const minutes = Math.max(0, Math.ceil((new Date(boost.expiresAt).getTime() - Date.now()) / 60000));
  return minutes > 0 ? `${boost.multiplier}x active, ${minutes}m left` : "Boost expired";
};
