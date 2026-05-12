const MODES = ["speedMath", "aptitude", "reaction", "challenge"];

export const emptyScores = () => ({
  speedMath: 0,
  aptitude: 0,
  reaction: 0,
  challenge: 0
});

export const calculateLevel = (xp) => Math.min(50, Math.floor(xp / 250) + 1);

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
  return {
    id: String(obj._id || obj.id),
    name: obj.name,
    email: obj.email,
    xp: obj.xp || 0,
    level: obj.level || 1,
    streak: obj.streak || 0,
    bestScores: { ...emptyScores(), ...(obj.bestScores || {}) },
    accuracy: { ...emptyScores(), ...(obj.accuracy || {}) },
    totalGamesPlayed: obj.totalGamesPlayed || 0,
    recentActivity: obj.recentActivity || []
  };
};

export const isValidMode = (mode) => MODES.includes(mode);
