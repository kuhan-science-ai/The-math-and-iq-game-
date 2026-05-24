import { Check, Gift, Lock, Sparkles, Timer, Trophy, Zap } from "lucide-react";
import React, { useState } from "react";
import amethystShard from "../assets/reward-shards/amethyst-derivative-shard.png";
import citrineShard from "../assets/reward-shards/citrine-integral-shard.png";
import diamondShard from "../assets/reward-shards/diamond-pythagorean-shard.png";
import emeraldShard from "../assets/reward-shards/emerald-nabla-shard.png";
import topazShard from "../assets/reward-shards/topaz-sigma-shard.png";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../lib/api.js";
import { activeBoostLabel, rewardCountForLevel, rewardPath } from "../lib/rewards.js";

const shardArtwork = [
  { name: "Topaz Shard", image: topazShard },
  { name: "Amethyst Shard", image: amethystShard },
  { name: "Citrine Shard", image: citrineShard },
  { name: "Emerald Shard", image: emeraldShard },
  { name: "Diamond Shard", image: diamondShard }
];

export const Rewards = ({ goTrain }) => {
  const { user, setUser } = useAuth();
  const nextReward = rewardPath.find((reward) => reward.level > user.level);
  const unlockedCount = rewardCountForLevel(user.level);
  const earnedRewards = user.earnedRewards || user.rewards || [];
  const consumables = earnedRewards.filter((reward) => reward.category === "consumable");
  const shardCount = earnedRewards.filter((reward) => reward.type === "shard").length;

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
        <span>{shardCount ? `${shardCount} milestone crystals unlocked` : "Unlock milestone crystals from the level road"}</span>
      </div>

      <div className="shard-showcase">
        {shardArtwork.map((shard) => (
          <ShardCollectible shard={shard} key={shard.name} />
        ))}
      </div>

      <div className="section-title reward-road-title">
        <h2>Level road</h2>
        <span>Swipe sideways to see every milestone reward</span>
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

const ShardCollectible = ({ shard }) => {
  const [rotated, setRotated] = useState(false);

  return (
    <article className="shard-art-card">
      <button
        type="button"
        className={`shard-image-button ${rotated ? "rotated" : ""}`}
        onClick={() => setRotated((value) => !value)}
        aria-label={`Rotate ${shard.name}`}
      >
        <img src={shard.image} alt={shard.name} />
      </button>
      <span>{shard.name}</span>
    </article>
  );
};
