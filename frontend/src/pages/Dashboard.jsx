import { Activity, Flame, Gift, Play, Star, Target, Trophy } from "lucide-react";
import React from "react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { modes } from "../lib/api.js";
import { levelProgress as getLevelProgress, xpForLevel } from "../lib/progression.js";
import { activeBoostLabel, rewardCountForLevel } from "../lib/rewards.js";

export const Dashboard = ({ goTrain, goRewards }) => {
  const { user } = useAuth();
  const xpProgress = user.xpProgress || getLevelProgress(user.xp);
  const storedLevel = Number(localStorage.getItem("brainBoostSeenLevel") || user.level);
  const shouldAnimateFromStoredLevel = storedLevel < user.level;
  const storedLevelProgress = getLevelProgress(Math.min(user.xp, xpForLevel(storedLevel + 1) - 1));
  const previousLevelRef = useRef(storedLevel);
  const previousProgressRef = useRef(storedLevelProgress);
  const [displayLevel, setDisplayLevel] = useState(shouldAnimateFromStoredLevel ? storedLevel : user.level);
  const [displayProgress, setDisplayProgress] = useState(shouldAnimateFromStoredLevel ? storedLevelProgress : xpProgress);
  const [levelingUp, setLevelingUp] = useState(false);
  const barWidth = displayProgress.required ? (displayProgress.progress / displayProgress.required) * 100 : 100;

  useEffect(() => {
    const previousLevel = previousLevelRef.current;
    const previousProgress = previousProgressRef.current;
    const didLevelUp = user.level > previousLevel;
    let fillTimer;
    let resetTimer;
    let settleTimer;

    if (didLevelUp) {
      setDisplayLevel(previousLevel);
      setDisplayProgress({ ...previousProgress, progress: previousProgress.required });
      setLevelingUp(true);

      fillTimer = setTimeout(() => {
        setDisplayLevel(user.level);
        setDisplayProgress({ ...xpProgress, progress: 0 });
      }, 650);

      resetTimer = setTimeout(() => {
        setDisplayProgress(xpProgress);
      }, 920);

      settleTimer = setTimeout(() => {
        setLevelingUp(false);
      }, 1500);
    } else {
      setDisplayLevel(user.level);
      setDisplayProgress(xpProgress);
      setLevelingUp(false);
    }

    previousLevelRef.current = user.level;
    previousProgressRef.current = xpProgress;
    localStorage.setItem("brainBoostSeenLevel", String(user.level));

    return () => {
      clearTimeout(fillTimer);
      clearTimeout(resetTimer);
      clearTimeout(settleTimer);
    };
  }, [user.level, user.xp, xpProgress.progress, xpProgress.required, xpProgress.remaining, xpProgress.nextLevelXp]);

  return (
    <section className="screen">
      <div className="topline">
        <div>
          <p className="eyebrow">Welcome back, {user.name}</p>
          <h1>Level {displayLevel} cognitive athlete</h1>
        </div>
        <div className="topline-actions">
          <button className="secondary compact" onClick={goRewards}><Gift size={18} /> Reward path</button>
          <button className="primary compact" onClick={goTrain}><Play size={18} /> Start training</button>
        </div>
      </div>

      <div className="profile-grid">
        <div className={`profile-panel ${levelingUp ? "leveling-up" : ""}`}>
          <div className="avatar">{user.name.slice(0, 1).toUpperCase()}</div>
          <div>
            <h2>{user.name}</h2>
            <p>{user.email}</p>
          </div>
          <div className="xp-wrap">
            <span>{levelingUp ? "Level up! XP bar reset for the next level." : `${displayProgress.progress}/${displayProgress.required} XP to next level`}</span>
            <div className={`xp-bar ${levelingUp ? "level-flash" : ""}`}><i style={{ width: `${barWidth}%` }} /></div>
            {levelingUp && <strong className="level-up-burst">Level {displayLevel}</strong>}
          </div>
        </div>

        <Stat icon={<Star />} label="Total XP" value={user.xp} colorClass="gold" />
        <Stat icon={<Flame />} label="Daily streak" value={`${user.streak} days`} colorClass="orange" />
        <Stat icon={<Activity />} label="Games played" value={user.totalGamesPlayed} colorClass="cyan" />
        <Stat icon={<Gift />} label="Road rewards" value={rewardCountForLevel(user.level)} colorClass="purple" />
      </div>

      <div className="activity-panel compact-panel">
        <div className="section-title tight">
          <h2>Active multiplier</h2>
          <Star size={20} />
        </div>
        <p>{activeBoostLabel(user.activeXpBoost)}</p>
      </div>

      <div className="section-title">
        <h2>Mode stats</h2>
        <span>Best scores and accuracy</span>
      </div>

      <div className="mode-grid">
        {Object.entries(modes).map(([key, label]) => (
          <article className={`mode-card mode-card-${key}`} key={key}>
            <div className="mode-icon"><Trophy size={20} /></div>
            <h3>{label}</h3>
            <strong>{user.bestScores?.[key] || 0}</strong>
            <p>{Math.round(user.accuracy?.[key] || 0)}% accuracy</p>
          </article>
        ))}
      </div>

      <div className="activity-panel">
        <div className="section-title tight">
          <h2>Recent activity</h2>
          <Target size={20} />
        </div>
        {user.recentActivity?.length ? (
          user.recentActivity.map((item, index) => <p key={`${item}-${index}`}>{item}</p>)
        ) : (
          <p>No games yet. Your first score will appear here.</p>
        )}
      </div>
    </section>
  );
};

const Stat = ({ icon, label, value, colorClass }) => (
  <article className={`stat-card stat-${colorClass}`}>
    <span>{icon}</span>
    <small>{label}</small>
    <strong>{value}</strong>
  </article>
);
