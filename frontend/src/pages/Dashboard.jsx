import { Activity, Flame, Gift, Play, Star, Target, Trophy } from "lucide-react";
import React from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { modes } from "../lib/api.js";
import { levelProgress as getLevelProgress } from "../lib/progression.js";
import { activeBoostLabel, rewardCountForLevel } from "../lib/rewards.js";

export const Dashboard = ({ goTrain, goRewards }) => {
  const { user } = useAuth();
  const xpProgress = user.xpProgress || getLevelProgress(user.xp);
  const barWidth = xpProgress.required ? (xpProgress.progress / xpProgress.required) * 100 : 100;

  return (
    <section className="screen">
      <div className="topline">
        <div>
          <p className="eyebrow">Welcome back, {user.name}</p>
          <h1>Level {user.level} cognitive athlete</h1>
        </div>
        <div className="topline-actions">
          <button className="secondary compact" onClick={goRewards}><Gift size={18} /> Reward path</button>
          <button className="primary compact" onClick={goTrain}><Play size={18} /> Start training</button>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-panel">
          <div className="avatar">{user.name.slice(0, 1).toUpperCase()}</div>
          <div>
            <h2>{user.name}</h2>
            <p>{user.email}</p>
          </div>
          <div className="xp-wrap">
            <span>{xpProgress.progress}/{xpProgress.required} XP to next level</span>
            <div className="xp-bar"><i style={{ width: `${barWidth}%` }} /></div>
          </div>
        </div>

        <Stat icon={<Star />} label="Total XP" value={user.xp} />
        <Stat icon={<Flame />} label="Daily streak" value={`${user.streak} days`} />
        <Stat icon={<Activity />} label="Games played" value={user.totalGamesPlayed} />
        <Stat icon={<Gift />} label="Road rewards" value={rewardCountForLevel(user.level)} />
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
          <article className="mode-card" key={key}>
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

const Stat = ({ icon, label, value }) => (
  <article className="stat-card">
    <span>{icon}</span>
    <small>{label}</small>
    <strong>{value}</strong>
  </article>
);
