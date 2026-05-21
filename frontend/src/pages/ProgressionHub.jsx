import { Award, BookOpen, Boxes, CalendarDays, Crown, Gem, Swords, Trophy, Users, Zap } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  achievements,
  animatedEffects,
  avatars,
  battlePass,
  chests,
  collectibles,
  consumables,
  currencies,
  dailyCalendar,
  events,
  leagues,
  levelPlan,
  masteryRanks,
  profileFrames,
  profileTitles,
  skillBranches,
  sqlSchema
} from "../lib/gamification.js";

const tabs = [
  ["overview", "Overview"],
  ["tree", "Skill tree"],
  ["achievements", "Achievements"],
  ["collection", "Collection"],
  ["pass", "Battle pass"],
  ["ranked", "Ranked"],
  ["events", "Events"],
  ["economy", "Economy"],
  ["endgame", "Endgame"]
];

export const ProgressionHub = ({ goTrain, goRewards }) => {
  const { user } = useAuth();
  const [tab, setTab] = useState("overview");
  const earnedRewards = user.earnedRewards || user.rewards || [];
  const earnedCollectibles = earnedRewards.filter((reward) => reward.category === "collectible").length;
  const simulatedAchievements = useMemo(() => achievements.slice(0, Math.min(achievements.length, Math.max(8, user.level * 2))), [user.level]);

  return (
    <section className="screen progression-screen">
      <div className="topline">
        <div>
          <p className="eyebrow">Gamification ecosystem</p>
          <h1>Brain Boost progression hub</h1>
        </div>
        <div className="topline-actions">
          <button className="secondary compact" onClick={goRewards}><Gem size={18} /> Reward road</button>
          <button className="primary compact" onClick={goTrain}><Zap size={18} /> Earn XP</button>
        </div>
      </div>

      <div className="progression-hero">
        <div>
          <span className="reward-orb"><Crown size={30} /></span>
          <h2>Level {user.level} {levelPlan[user.level - 1]?.title || "Legend"}</h2>
          <p>200-level RPG progression with prestige, mastery ranks, chests, collections, leagues, and seasonal rewards.</p>
        </div>
        <Stat label="Achievements" value={`${simulatedAchievements.length}/${achievements.length}`} />
        <Stat label="Collectibles" value={`${earnedCollectibles}/${collectibles.length}`} />
        <Stat label="Battle pass" value={`Tier ${Math.min(100, Math.max(1, Math.floor((user.xp || 0) / 350)))}`} />
      </div>

      <div className="hub-tabs">
        {tabs.map(([key, label]) => (
          <button key={key} className={tab === key ? "active" : ""} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>

      {tab === "overview" && <Overview user={user} />}
      {tab === "tree" && <SkillTree />}
      {tab === "achievements" && <AchievementGallery unlocked={simulatedAchievements} />}
      {tab === "collection" && <Collection />}
      {tab === "pass" && <BattlePass user={user} />}
      {tab === "ranked" && <Ranked />}
      {tab === "events" && <Events />}
      {tab === "economy" && <Economy />}
      {tab === "endgame" && <Endgame />}
    </section>
  );
};

const Stat = ({ label, value }) => (
  <article className="stat-card compact-stat">
    <small>{label}</small>
    <strong>{value}</strong>
  </article>
);

const Overview = ({ user }) => {
  const nextRewards = levelPlan.slice(Math.max(0, user.level - 1), Math.max(0, user.level - 1) + 8);

  return (
    <>
      <div className="section-title">
        <h2>Next level rewards</h2>
        <span>Horizontal roadmap toward prestige</span>
      </div>
      <div className="level-bracket-road">
        {nextRewards.map((item) => (
          <article className="system-card" key={item.level}>
            <small>Level {item.level}</small>
            <h3>{item.title}</h3>
            <p>{item.unlock}</p>
            <strong>{item.xpRequired.toLocaleString()} XP gate</strong>
          </article>
        ))}
      </div>

      <div className="progression-grid">
        <SystemCard icon={<BookOpen />} title="Knowledge tree" text="13 topic nodes across Mathematics and Aptitude with six mastery ranks each." />
        <SystemCard icon={<Award />} title="500 achievements" text="Accuracy, speed, streaks, mastery, collection, events, social, and ranked goals." />
        <SystemCard icon={<Boxes />} title="300 collectibles" text="Artifacts, scientist relics, crystals, scrolls, trophies, and seasonal items." />
        <SystemCard icon={<Trophy />} title="Ranked leagues" text="Bronze to Legend weekly brackets with promotion, demotion, and seasonal frames." />
      </div>
    </>
  );
};

const SystemCard = ({ icon, title, text }) => (
  <article className="system-card">
    <span className="mode-icon">{icon}</span>
    <h3>{title}</h3>
    <p>{text}</p>
  </article>
);

const SkillTree = () => (
  <div className="skill-tree">
    {skillBranches.map((branch) => (
      <article className={`tree-branch branch-${branch.color}`} key={branch.name}>
        <div className="section-title tight">
          <h2>{branch.name}</h2>
          <BookOpen size={20} />
        </div>
        <div className="tree-nodes">
          {branch.topics.map((topic) => (
            <div className="tree-node" key={topic.id}>
              <strong>{topic.name}</strong>
              <span>{topic.xp.toLocaleString()} XP</span>
              <small>Unlock: {topic.unlock}</small>
              <p>{topic.reward}</p>
            </div>
          ))}
        </div>
      </article>
    ))}
    <div className="mastery-strip">
      {masteryRanks.map((rank) => (
        <article className="mini-card" key={rank.rank}>
          <strong>{rank.rank}</strong>
          <span>{rank.questions} questions</span>
          <small>{rank.accuracy}% accuracy</small>
          <p>{rank.reward}</p>
        </article>
      ))}
    </div>
  </div>
);

const AchievementGallery = ({ unlocked }) => (
  <>
    <div className="section-title">
      <h2>Achievement gallery</h2>
      <span>{achievements.length} generated achievements with rarity rewards</span>
    </div>
    <div className="catalog-grid">
      {achievements.slice(0, 60).map((achievement) => {
        const isUnlocked = unlocked.some((item) => item.id === achievement.id);
        return (
          <article className={`catalog-card rarity-${achievement.rarity.toLowerCase()} ${isUnlocked ? "unlocked" : ""}`} key={achievement.id}>
            <small>{achievement.category} / {achievement.rarity}</small>
            <h3>{achievement.name}</h3>
            <p>{achievement.description}</p>
            <span>{isUnlocked ? "Unlocked" : achievement.reward}</span>
          </article>
        );
      })}
    </div>
  </>
);

const Collection = () => (
  <>
    <div className="section-title">
      <h2>Collection vault</h2>
      <span>{collectibles.length} collectibles, {avatars.length} avatar classes, {profileFrames.length} frames, {profileTitles.length} titles</span>
    </div>
    <div className="progression-grid">
      {collectibles.slice(0, 24).map((item) => (
        <article className={`catalog-card rarity-${item.rarity.toLowerCase()}`} key={item.id}>
          <small>{item.set} / {item.rarity}</small>
          <h3>{item.name}</h3>
          <p>{item.lore}</p>
          <span>{item.effect}</span>
        </article>
      ))}
    </div>
    <div className="section-title">
      <h2>Avatar evolutions</h2>
      <span>Five stages per avatar class</span>
    </div>
    <div className="avatar-grid">
      {avatars.map((avatar) => (
        <article className="system-card" key={avatar.id}>
          <span className="mode-icon"><Users size={20} /></span>
          <h3>{avatar.name}</h3>
          <p>{avatar.stages.join(" -> ")}</p>
          <small>{avatar.rarity} / {avatar.unlock}</small>
        </article>
      ))}
    </div>
  </>
);

const BattlePass = ({ user }) => {
  const tier = Math.min(100, Math.max(1, Math.floor((user.xp || 0) / 350)));
  return (
    <>
      <div className="section-title">
        <h2>Season battle pass</h2>
        <span>Free and premium tracks, cosmetic-only premium power</span>
      </div>
      <div className="battle-pass-road">
        {battlePass.map((item) => (
          <article className={`pass-tier ${item.tier <= tier ? "claimed" : ""}`} key={item.tier}>
            <small>Tier {item.tier}</small>
            <strong>{item.xp.toLocaleString()} XP</strong>
            <p>Free: {item.freeReward}</p>
            <p>Premium: {item.premiumReward}</p>
          </article>
        ))}
      </div>
    </>
  );
};

const Ranked = () => (
  <div className="progression-grid">
    {leagues.map((league) => (
      <article className="system-card league-card" key={league.name}>
        <span className="mode-icon"><Trophy size={20} /></span>
        <h3>{league.name}</h3>
        <p>{league.promotion}</p>
        <small>{league.demotion}</small>
        <strong>{league.reward}</strong>
      </article>
    ))}
  </div>
);

const Events = () => (
  <>
    <div className="progression-grid">
      {events.map((event) => (
        <article className="system-card" key={event.name}>
          <span className="mode-icon"><Swords size={20} /></span>
          <h3>{event.name}</h3>
          <p>{event.progression}</p>
          <strong>{event.reward}</strong>
        </article>
      ))}
    </div>
    <div className="section-title">
      <h2>365-day calendar</h2>
      <span>Daily rewards with weekly, monthly, and yearly spikes</span>
    </div>
    <div className="calendar-strip">
      {dailyCalendar.slice(0, 60).map((day) => (
        <article className="mini-card" key={day.day}>
          <small>Day {day.day}</small>
          <strong>{day.reward}</strong>
        </article>
      ))}
    </div>
  </>
);

const Economy = () => (
  <>
    <div className="progression-grid">
      {currencies.map((currency) => (
        <article className="system-card" key={currency.name}>
          <span className="mode-icon"><Gem size={20} /></span>
          <h3>{currency.name}</h3>
          <p>Sources: {currency.sources}</p>
          <small>Sinks: {currency.sinks}</small>
        </article>
      ))}
      {consumables.map((item) => (
        <article className="system-card" key={item.name}>
          <span className="mode-icon"><Zap size={20} /></span>
          <h3>{item.name}</h3>
          <p>{item.use}</p>
          <small>{item.balance}</small>
          <strong>{item.value} coins</strong>
        </article>
      ))}
    </div>
    <div className="section-title">
      <h2>Chest drop system</h2>
      <span>Duplicate protection and guaranteed reward rules</span>
    </div>
    <div className="progression-grid">
      {chests.map((chest) => (
        <article className="system-card" key={chest.name}>
          <span className="mode-icon"><Boxes size={20} /></span>
          <h3>{chest.name}</h3>
          <p>{chest.pool}</p>
          <strong>{chest.collectibleChance}% collectible chance</strong>
          <small>{chest.guarantee}</small>
        </article>
      ))}
    </div>
  </>
);

const Endgame = () => (
  <>
    <div className="progression-grid">
      <SystemCard icon={<Crown />} title="Prestige ranks" text="After Level 200, reset into Prestige while keeping collections and cosmetics." />
      <SystemCard icon={<Trophy />} title="Hall of Fame" text="Seasonal records for Legend players, perfect streaks, boss clears, and mastery scores." />
      <SystemCard icon={<Gem />} title="Mythic collections" text="Prestige shards buy mythic cosmetics without creating pay-to-win power." />
      <SystemCard icon={<CalendarDays />} title="Seasonal resets" text="Rank and battle-pass reset each season while mastery and collections remain permanent." />
    </div>
    <div className="activity-panel schema-panel">
      <div className="section-title tight">
        <h2>Database blueprint</h2>
        <span>SQL-ready entities for future backend expansion</span>
      </div>
      {sqlSchema.map((line) => <code key={line}>{line}</code>)}
    </div>
    <div className="section-title">
      <h2>Cosmetic depth</h2>
      <span>{profileFrames.length} frames, {profileTitles.length} titles, {animatedEffects.length} animated effects</span>
    </div>
  </>
);
