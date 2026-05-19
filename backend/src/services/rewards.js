const majorRewards = {
  5: ["Bronze Focus Badge", "badge", "Rare", "A clean starter badge for locking in early consistency."],
  10: ["Speed Math Reactor", "booster", "Epic", "A score multiplier theme earned by reaching double digits."],
  15: ["Logic Streak Crown", "crown", "Epic", "A crown for steady reasoning and puzzle accuracy."],
  20: ["Neon Solver Frame", "frame", "Legendary", "A profile frame for serious training momentum."],
  25: ["Aptitude Master Card", "card", "Legendary", "A collectible card for clearing the mid-road wall."],
  30: ["Reaction Blade Trail", "trail", "Mythic", "A fast-response reward for sharper reflex work."],
  35: ["Cognitive Champion Emblem", "emblem", "Mythic", "A high-tier emblem for advanced progression."],
  40: ["Impossible Mode Crest", "crest", "Ascendant", "A crest reserved for the hardest training stretch."],
  45: ["Brain Boost Elite Aura", "aura", "Ascendant", "A glowing aura for elite-level users."],
  50: ["Level 50 Grandmaster Trophy", "trophy", "Grandmaster", "The final road reward for completing the full path."]
};

const minorNames = [
  "XP Spark",
  "Focus Token",
  "Accuracy Chip",
  "Logic Shard",
  "Speed Core",
  "Streak Gem"
];

const rewardForLevel = (level) => {
  const major = majorRewards[level];
  if (major) {
    const [name, type, rarity, description] = major;
    return { level, name, type, rarity, description };
  }

  const name = minorNames[level % minorNames.length];
  return {
    level,
    name: `${name} ${level}`,
    type: "token",
    rarity: level >= 30 ? "Epic" : level >= 15 ? "Rare" : "Common",
    description: `Unlocked for reaching Level ${level}.`
  };
};

export const rewardPath = Array.from({ length: 49 }, (_, index) => rewardForLevel(index + 2));

export const rewardsForLevel = (level = 1) => rewardPath.filter((reward) => reward.level <= Number(level || 1));

export const rewardsBetweenLevels = (previousLevel = 1, nextLevel = 1) =>
  rewardPath.filter((reward) => reward.level > Number(previousLevel || 1) && reward.level <= Number(nextLevel || 1));

export const mergeRewards = (currentRewards = [], newRewards = []) => {
  const seen = new Set();
  return [...currentRewards, ...newRewards].filter((reward) => {
    const key = `${reward.level}-${reward.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
