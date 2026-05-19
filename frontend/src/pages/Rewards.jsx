import { Check, Gift, Lock, Sparkles, Timer, Trophy, Zap } from "lucide-react";
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../lib/api.js";
import { activeBoostLabel, rewardCountForLevel, rewardPath } from "../lib/rewards.js";

export const Rewards = ({ goTrain }) => {
  const { user, setUser } = useAuth();
  const nextReward = rewardPath.find((reward) => reward.level > user.level);
  const unlockedCount = rewardCountForLevel(user.level);
  const earnedRewards = user.earnedRewards || user.rewards || [];
  const consumables = earnedRewards.filter((reward) => reward.category === "consumable");
  const shards = earnedRewards.filter((reward) => reward.type === "shard");

  const useReward = async (rewardId) => {
    const data = await api("/user/rewards/use", {
      method: "POST",
      body: JSON.stringify({ rewardId })
    });
    setUser(data.user);
  };

  return (
    <section className="screen">
      <div className="topline">
        <div>
          <p className="eyebrow">Reward path</p>
          <h1>Level road rewards</h1>
        </div>
        <button className="primary compact" onClick={goTrain}>
          <Sparkles size={18} /> Earn more XP
        </button>
      </div>

      <div className="reward-hero">
        <div>
          <span className="reward-orb"><Trophy size={30} /></span>
          <h2>Level {user.level}</h2>
          <p>{unlockedCount} road rewards unlocked. XP multipliers appear every 5 levels.</p>
        </div>
        <div className="next-reward">
          <small>Active XP boost</small>
          <strong>{activeBoostLabel(user.activeXpBoost)}</strong>
          <span>Use earned multiplier rewards to boost XP for a limited time.</span>
        </div>
        <div className="next-reward">
          <small>Next road reward</small>
          {nextReward ? (
            <>
              <strong>{nextReward.name}</strong>
              <span>Unlocks at Level {nextReward.level}</span>
            </>
          ) : (
            <>
              <strong>Grandmaster road complete</strong>
              <span>You unlocked the full path.</span>
            </>
          )}
        </div>
      </div>

      <div className="section-title">
        <h2>Earned rewards</h2>
        <span>Consumable multipliers live here until used</span>
      </div>

      <div className="earned-grid">
        {consumables.length ? (
          consumables.map((reward) => (
            <article className="earned-card" key={reward.id}>
              <div className="reward-icon"><Zap size={22} /></div>
              <div>
                <h3>{reward.name}</h3>
                <p>{reward.description}</p>
                <small><Timer size={14} /> {reward.durationMinutes} minutes / {reward.rarity}</small>
              </div>
              <button className="primary compact" onClick={() => useReward(reward.id)}>Use</button>
            </article>
          ))
        ) : (
          <div className="empty-state">No XP multipliers waiting. Reach a multiple of 5 levels to earn one.</div>
        )}
      </div>

      <div className="section-title">
        <h2>Milestone crystals</h2>
        <span>Click a gem to rotate it</span>
      </div>

      <div className="shard-grid">
        {shards.length ? (
          shards.map((reward) => (
            <article className={`shard-card shard-${String(reward.color || "").toLowerCase()}`} key={reward.id}>
              <ShardCrystal reward={reward} />
              <h3>{reward.name}</h3>
              <p>{reward.description}</p>
              <small>{reward.rarity}</small>
            </article>
          ))
        ) : (
          <div className="empty-state">No milestone crystals yet. Reach Level 5 to earn the first one.</div>
        )}
      </div>

      <div className="reward-road" aria-label="Level reward path">
        {rewardPath.map((reward) => {
          const unlocked = user.level >= reward.level;
          const earned = earnedRewards.some((item) => item.id === reward.id);
          return (
            <article className={`reward-node ${unlocked ? "unlocked" : "locked"}`} key={reward.id}>
              <div className="reward-level">
                <span>Level {reward.level}</span>
                {unlocked ? <Check size={18} /> : <Lock size={18} />}
              </div>
              <div className="reward-icon"><Gift size={22} /></div>
              <div>
                <h3>{reward.name}</h3>
                <p>{reward.description}</p>
              </div>
              <small>{reward.category === "consumable" && unlocked && !earned ? "Used" : reward.rarity}</small>
            </article>
          );
        })}
      </div>
    </section>
  );
};

const ShardCrystal = ({ reward }) => {
  const [rotated, setRotated] = useState(false);
  const color = String(reward.color || "").toLowerCase();

  return (
    <button
      type="button"
      className={`shard-crystal shard-${color} ${rotated ? "rotated" : ""}`}
      aria-label={`Rotate ${reward.name}`}
      onClick={() => setRotated((value) => !value)}
    >
      <span className="shard-scene">
        <span className="shard-body">
          <i className="shard-face shard-front" />
          <i className="shard-face shard-left" />
          <i className="shard-face shard-right" />
          <i className="shard-face shard-top" />
          <i className="shard-face shard-bottom" />
        </span>
        <span className="shard-stand">
          <b>{reward.gem || reward.color}</b>
        </span>
      </span>
    </button>
  );
};
