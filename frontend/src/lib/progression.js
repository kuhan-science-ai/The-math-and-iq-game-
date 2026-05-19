export const xpRequiredForLevelUp = (level = 1) => 200 + Math.max(1, Number(level || 1)) * 50;

export const xpForLevel = (level = 1) => {
  const targetLevel = Math.min(50, Math.max(1, Math.floor(Number(level || 1))));
  let total = 0;
  for (let currentLevel = 1; currentLevel < targetLevel; currentLevel += 1) {
    total += xpRequiredForLevelUp(currentLevel);
  }
  return total;
};

export const calculateLevel = (xp = 0) => {
  const totalXp = Math.max(0, Number(xp || 0));
  let level = 1;

  while (level < 50 && totalXp >= xpForLevel(level + 1)) {
    level += 1;
  }

  return level;
};

export const levelProgress = (xp = 0) => {
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
