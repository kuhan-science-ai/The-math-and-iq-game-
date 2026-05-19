import { Check, Gift, Lock, Sparkles, Trophy } from "lucide-react";
import React from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { rewardPath } from "../lib/rewards.js";

export const Rewards = ({ goTrain }) => {
  const { user } = useAuth();
  const nextReward = rewardPath.find((reward) => reward.level > user.level);
  const unlockedCount = rewardPath.filter((reward) => reward.level <= user.level).length;

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
          <p>{unlockedCount} rewards unlocked. Every new level gives one reward.</p>
        </div>
        <div className="next-reward">
          <small>Next reward</small>
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

      <div className="reward-road" aria-label="Level reward path">
        {rewardPath.map((reward) => {
          const unlocked = user.level >= reward.level;
          return (
            <article className={`reward-node ${unlocked ? "unlocked" : "locked"}`} key={reward.level}>
              <div className="reward-level">
                <span>Level {reward.level}</span>
                {unlocked ? <Check size={18} /> : <Lock size={18} />}
              </div>
              <div className="reward-icon"><Gift size={22} /></div>
              <div>
                <h3>{reward.name}</h3>
                <p>{reward.description}</p>
              </div>
              <small>{reward.rarity}</small>
            </article>
          );
        })}
      </div>
    </section>
  );
};
