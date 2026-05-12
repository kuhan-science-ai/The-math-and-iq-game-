import { Activity, Flame, Play, Star, Target, Trophy } from "lucide-react";
import React from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { modes } from "../lib/api.js";

export const Dashboard = ({ goTrain }) => {
  const { user } = useAuth();
  const levelProgress = user.xp % 250;

  return (
    <section className="screen">
      <div className="topline">
        <div>
          <p className="eyebrow">Welcome back, {user.name}</p>
          <h1>Level {user.level} cognitive athlete</h1>
        </div>
        <button className="primary compact" onClick={goTrain}><Play size={18} /> Start training</button>
      </div>

      <div className="profile-grid">
        <div className="profile-panel">
          <div className="avatar">{user.name.slice(0, 1).toUpperCase()}</div>
          <div>
            <h2>{user.name}</h2>
            <p>{user.email}</p>
          </div>
          <div className="xp-wrap">
            <span>{levelProgress}/250 XP to next level</span>
            <div className="xp-bar"><i style={{ width: `${(levelProgress / 250) * 100}%` }} /></div>
          </div>
        </div>

        <Stat icon={<Star />} label="Total XP" value={user.xp} />
        <Stat icon={<Flame />} label="Daily streak" value={`${user.streak} days`} />
        <Stat icon={<Activity />} label="Games played" value={user.totalGamesPlayed} />
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
