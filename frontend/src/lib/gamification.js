const rarities = ["Common", "Rare", "Epic", "Legendary", "Mythic"];

const levelTitleFor = (level) => {
  if (level >= 200) return "Legend";
  if (level >= 151) return "Luminary";
  if (level >= 126) return "Genius";
  if (level >= 101) return "Grand Scholar";
  if (level >= 76) return "Mastermind";
  if (level >= 51) return "Analyst";
  if (level >= 26) return "Strategist";
  if (level >= 11) return "Solver";
  return "Explorer";
};

export const levelPlan = Array.from({ length: 200 }, (_, index) => {
  const level = index + 1;
  return {
    level,
    title: levelTitleFor(level),
    xpRequired: Math.round((250 * 1.075 ** index) / 25) * 25,
    unlock:
      level % 25 === 0 ? "Legendary milestone chest" :
      level % 10 === 0 ? "Profile frame and ranked badge" :
      level % 5 === 0 ? "XP multiplier and logic crystal" :
      "Coins, tokens, and reward-road progress"
  };
});

export const skillBranches = [
  {
    name: "Mathematics",
    color: "green",
    topics: [
      ["Arithmetic", 0, "Starter node", "Beginner arithmetic round"],
      ["Algebra", 750, "Arithmetic Skilled", "Algebra scroll and 250 XP"],
      ["Geometry", 1200, "Arithmetic Apprentice", "Compass badge"],
      ["Trigonometry", 2600, "Geometry Skilled", "Sine wave frame"],
      ["Probability", 3200, "Algebra Skilled", "Rare probability chest"],
      ["Statistics", 5200, "Probability Skilled", "Data sage nameplate"],
      ["Calculus", 7600, "Algebra Expert", "Limit breaker title"]
    ]
  },
  {
    name: "Aptitude",
    color: "purple",
    topics: [
      ["Quantitative Aptitude", 0, "Starter node", "Speed solver badge"],
      ["Logical Reasoning", 650, "Quant Beginner", "Logic crystal"],
      ["Analytical Reasoning", 1800, "Logic Skilled", "Analyst frame"],
      ["Data Interpretation", 2900, "Algebra Apprentice", "Chart master title"],
      ["Verbal Ability", 2200, "Logic Apprentice", "Verbal spark chest"],
      ["Critical Thinking", 5200, "Analytical Expert", "Boss battle access"]
    ]
  }
].map((branch) => ({
  ...branch,
  topics: branch.topics.map(([name, xp, unlock, reward], index) => ({
    id: `${branch.name.toLowerCase()}-${index}`,
    name,
    xp,
    unlock,
    reward,
    ranks: ["Beginner", "Apprentice", "Skilled", "Expert", "Master", "Grandmaster"]
  }))
}));

const achievementCategories = ["Accuracy", "Speed", "Consistency", "Mastery", "Streaks", "Collection", "Exploration", "Events", "Social", "Competitive"];
const achievementMilestones = [1, 5, 10, 25, 50, 100, 150, 250, 365, 500];

export const achievements = achievementCategories.flatMap((category) =>
  achievementMilestones.flatMap((milestone, index) =>
    rarities.map((rarity, rarityIndex) => ({
      id: `${category.toLowerCase()}-${milestone}-${rarity.toLowerCase()}`,
      name: `${category} ${milestone} ${rarity}`,
      category,
      rarity,
      description: `Complete ${milestone * (rarityIndex + 1)} ${category.toLowerCase()} goals.`,
      requirement: `${category} milestone score ${milestone * (rarityIndex + 1)}`,
      reward: `${50 * (rarityIndex + 1)} XP, ${100 * (rarityIndex + 1)} coins`
    }))
  )
);

const collectibleSets = [
  ["Ancient Math Artifacts", ["Euclid Compass", "Babylon Tablet", "Golden Abacus", "Pythagoras Lyre", "Archimedes Lever"]],
  ["Scientist Relics", ["Newton Prism", "Ramanujan Notebook", "Turing Cog", "Noether Ring", "Hypatia Astrolabe"]],
  ["Logic Crystals", ["Ruby Sum Shard", "Sapphire Proof Core", "Emerald Ratio Gem", "Amethyst Pattern Lens", "Topaz Limit Stone"]],
  ["Knowledge Scrolls", ["Scroll of Algebra", "Scroll of Limits", "Scroll of Probability", "Scroll of Geometry", "Scroll of Proofs"]],
  ["Legendary Trophies", ["Olympiad Crown", "Zeta Medal", "Prime Hunter Cup", "Calculus Crest", "Grandmaster Laurel"]],
  ["Seasonal Collectibles", ["Winter Equation Orb", "Solar Pi Token", "Monsoon Matrix", "Festival Fractal", "Nova Number Star"]]
];

export const collectibles = collectibleSets.flatMap(([set, names], setIndex) =>
  Array.from({ length: 50 }, (_, index) => {
    const rarity = rarities[(index + setIndex) % rarities.length];
    const base = names[index % names.length];
    return {
      id: `${set.toLowerCase().replaceAll(" ", "-")}-${index + 1}`,
      name: `${base} ${index + 1}`,
      set,
      rarity,
      lore: `${base} carries a fragment of ${set.toLowerCase()} knowledge.`,
      source: index % 5 === 0 ? "Event reward" : index % 3 === 0 ? "Chest drop" : "Mastery milestone",
      effect: rarity === "Mythic" ? "Animated profile aura" : "Profile showcase glow"
    };
  })
);

export const avatars = [
  "Math Wizard",
  "Cyber Solver",
  "Quantum Scholar",
  "Logic Ninja",
  "AI Professor",
  "Galaxy Explorer",
  "Olympiad Knight",
  "Data Sage",
  "Prime Hunter",
  "Zeta Oracle"
].map((name, index) => ({
  id: `avatar-${index + 1}`,
  name,
  rarity: rarities[index % rarities.length],
  stages: ["Novice", "Trained", "Elite", "Ascended", "Mythic"],
  unlock: index % 2 === 0 ? "Level milestone" : "Topic mastery",
  upgrades: ["Glow trim", "Animated pose", "Prestige variant"]
}));

export const profileFrames = Array.from({ length: 100 }, (_, index) => ({
  id: `frame-${index + 1}`,
  name: `${rarities[index % rarities.length]} Scholar Frame ${index + 1}`,
  rarity: rarities[index % rarities.length],
  unlock: index % 10 === 0 ? "Battle pass tier" : "Level reward"
}));

export const profileTitles = Array.from({ length: 100 }, (_, index) => {
  const names = ["Fast Thinker", "Algebra Adept", "Logic Breaker", "Human Calculator", "Prime Hunter", "Grand Scholar", "Mythic Solver", "Brain Boost Legend"];
  return {
    id: `title-${index + 1}`,
    name: `${names[index % names.length]} ${index + 1}`,
    rarity: rarities[index % rarities.length],
    unlock: index % 5 === 0 ? "Achievement reward" : "Mastery rank"
  };
});

export const animatedEffects = Array.from({ length: 50 }, (_, index) => {
  const effects = ["Floating equations", "Rotating crystals", "Lightning border", "Matrix numbers", "Golden aura", "Zeta wave", "Galaxy spiral", "Prestige fireline"];
  return {
    id: `effect-${index + 1}`,
    name: `${effects[index % effects.length]} ${index + 1}`,
    rarity: rarities[index % rarities.length],
    unlock: "Profile customization reward"
  };
});

export const consumables = [
  ["Hint", "Reveal one clue", "Limited per round", 80],
  ["XP Booster", "Multiply XP for a timer", "Cannot stack with another booster", 300],
  ["Streak Shield", "Protect one missed day", "Maximum 3 stored", 500],
  ["Question Skip", "Skip without penalty", "Disabled in ranked", 120],
  ["Time Freeze", "Pause timer for 5 seconds", "One per timed round", 180],
  ["Accuracy Buff", "Forgive one mistake", "Practice modes only", 240],
  ["Treasure Key", "Open bonus chests", "Weekly earn limit", 400],
  ["Reward Multiplier", "Double chest coins", "Does not affect ranked points", 350]
].map(([name, use, balance, value]) => ({ name, use, balance, value }));

export const currencies = [
  ["Coins", "Games, quests, chests", "Hints, cosmetics, common chests"],
  ["Gems", "Events, milestones, premium pass", "Rare cosmetics and premium chests"],
  ["Knowledge Tokens", "Topic mastery and lessons", "Skill unlocks and scrolls"],
  ["Prestige Shards", "Prestige resets", "Mythic cosmetics and Hall of Fame items"]
].map(([name, sources, sinks]) => ({ name, sources, sinks }));

export const chests = [
  ["Common Chest", 5, "Coins, hints, common collectibles"],
  ["Rare Chest", 15, "Rare cosmetics, boosters, tokens"],
  ["Epic Chest", 35, "Epic collectibles and animated borders"],
  ["Legendary Chest", 70, "Legendary trophies and avatar upgrades"],
  ["Mythic Chest", 100, "Guaranteed mythic reward pool"]
].map(([name, collectibleChance, pool]) => ({
  name,
  collectibleChance,
  pool,
  guarantee: name === "Mythic Chest" ? "New mythic if available" : "Duplicate protection increases after each duplicate"
}));

export const dailyCalendar = Array.from({ length: 365 }, (_, index) => {
  const day = index + 1;
  return {
    day,
    reward:
      day === 365 ? "Mythic title: Yearlong Legend" :
      day % 100 === 0 ? "Legendary collectible" :
      day % 30 === 0 ? "Animated cosmetic" :
      day % 7 === 0 ? "Rare chest" :
      `${100 + (day % 10) * 25} coins`
  };
});

export const leagues = ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grandmaster", "Legend"].map((name, index) => ({
  name,
  minPoints: index * 1000,
  promotion: index < 7 ? "Top 10 weekly bracket promote" : "Top 1 percent enters Hall of Fame",
  demotion: index >= 2 ? "Bottom 10 demote after week closes" : "No demotion",
  reward: `${rarities[Math.min(index, 4)]} seasonal frame`
}));

export const events = [
  ["Weekend Challenge", "Three-day score sprint", "Epic chest"],
  ["Math Olympiad", "High accuracy advanced math ladder", "Olympiad Crown shard"],
  ["Logic Tournament", "Bracketed reasoning battles", "Logic crystal"],
  ["Speed Week", "Timed sprint missions", "Lightning border"],
  ["Accuracy Week", "Perfect round streaks", "Precision title"],
  ["Treasure Hunt", "Find keys through quests", "Treasure chests"],
  ["Boss Battles", "Community HP boss", "Boss trophy"]
].map(([name, progression, reward]) => ({ name, progression, reward }));

export const battlePass = Array.from({ length: 100 }, (_, index) => {
  const tier = index + 1;
  return {
    tier,
    xp: tier * 350,
    freeReward: tier % 10 === 0 ? "Chest" : tier % 5 === 0 ? "XP booster" : "Coins",
    premiumReward: tier === 100 ? "Mythic frame and title" : tier % 25 === 0 ? "Avatar evolution" : "Cosmetic bundle",
    unlock: "Earn pass XP from quests, games, and events"
  };
});

export const masteryRanks = ["Beginner", "Apprentice", "Skilled", "Expert", "Master", "Grandmaster"].map((rank, index) => ({
  rank,
  questions: [20, 75, 200, 500, 1000, 2500][index],
  accuracy: [60, 70, 80, 85, 90, 95][index],
  reward: ["50 XP", "150 XP", "Rare chest", "Topic badge", "Animated title", "Mythic collectible chance"][index]
}));

export const sqlSchema = [
  "users(id, email, username, level, xp, prestige, coins, gems, created_at)",
  "user_stats(user_id, total_games, accuracy, streak, best_scores_json)",
  "topics(id, branch, name, xp_required)",
  "user_topic_mastery(user_id, topic_id, rank, xp, questions_done, accuracy)",
  "achievements(id, name, category, rarity, requirement_json, reward_json)",
  "user_achievements(user_id, achievement_id, unlocked_at)",
  "collectibles(id, name, set_name, rarity, lore, effect)",
  "user_collectibles(user_id, collectible_id, obtained_at, equipped)",
  "inventory(user_id, item_id, quantity)",
  "consumables(id, name, rarity, effect_json, value)",
  "chests(id, name, rarity, drop_table_json)",
  "events(id, name, type, starts_at, ends_at, reward_json)",
  "rankings(user_id, season_id, rank, points, bracket_id)",
  "battle_pass_tiers(season_id, tier, free_reward_json, premium_reward_json, xp_required)",
  "user_battle_pass(user_id, season_id, tier, xp, premium)"
];
