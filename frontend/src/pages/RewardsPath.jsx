import { Award, Check, Compass, Gift, Lock, Navigation, Sparkles, Star, Trophy, Zap } from "lucide-react";
import React, { useMemo, useState, useEffect, useRef } from "react";
import amethystShard from "../assets/reward-shards/amethyst-derivative-shard.png";
import citrineShard from "../assets/reward-shards/citrine-integral-shard.png";
import diamondShard from "../assets/reward-shards/diamond-pythagorean-shard.png";
import emeraldShard from "../assets/reward-shards/emerald-nabla-shard.png";
import topazShard from "../assets/reward-shards/topaz-sigma-shard.png";
import { useAuth } from "../context/AuthContext.jsx";
import { rewardPath } from "../lib/rewards.js";

const shardImageForReward = (reward = {}) => {
  const key = String(reward.gem || reward.color || reward.name || "").toLowerCase();
  if (key.includes("amethyst")) return amethystShard;
  if (key.includes("emerald")) return emeraldShard;
  if (key.includes("topaz") || key.includes("sapphire")) return topazShard;
  if (key.includes("ruby") || key.includes("citrine")) return citrineShard;
  return diamondShard;
};

export const RewardsPath = ({ goTrain }) => {
  const { user } = useAuth();
  const [filterMilestones, setFilterMilestones] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState(null);
  
  const timelineEndRef = useRef(null);
  const levelNodesRefs = useRef({});

  // Group rewards by level
  const rewardsByLevel = useMemo(() => {
    const grouped = {};
    rewardPath.forEach((reward) => {
      const lvl = reward.level;
      if (!grouped[lvl]) {
        grouped[lvl] = [];
      }
      grouped[lvl].push(reward);
    });
    return grouped;
  }, []);

  // Determine list of levels to display (up to Level 50 for the primary milestone road)
  const maxRoadLevel = 50;
  const levels = useMemo(() => {
    const list = [];
    for (let i = 2; i <= maxRoadLevel; i++) {
      const hasRewards = rewardsByLevel[i]?.length > 0;
      if (hasRewards) {
        if (!filterMilestones || i % 5 === 0 || i === 2) {
          list.push({
            level: i,
            rewards: rewardsByLevel[i],
            isMilestone: i % 5 === 0,
            isUnlocked: user.level >= i
          });
        }
      }
    }
    return list;
  }, [rewardsByLevel, filterMilestones, user.level]);

  // Calculate overall path fill percentage for the progress bar
  const progressPercent = useMemo(() => {
    if (user.level <= 2) return 0;
    if (user.level >= maxRoadLevel) return 100;
    return ((user.level - 2) / (maxRoadLevel - 2)) * 100;
  }, [user.level]);

  // Find next milestone info
  const nextMilestone = useMemo(() => {
    for (let i = user.level + 1; i <= maxRoadLevel; i++) {
      if (i % 5 === 0) {
        const rewards = rewardsByLevel[i] || [];
        const cosmetic = rewards.find(r => r.category === "cosmetic");
        const multiplier = rewards.find(r => r.category === "consumable");
        return {
          level: i,
          levelsLeft: i - user.level,
          rewardName: cosmetic ? cosmetic.name : (multiplier ? multiplier.name : "Milestone Shards")
        };
      }
    }
    return null;
  }, [user.level, rewardsByLevel]);

  // Auto-scroll to the user's current level on load
  const scrollToMyLevel = () => {
    // Find closest rendered level to user's level
    let targetLvl = 2;
    const renderedLevels = levels.map(l => l.level);
    
    // Find the highest rendered level <= user.level
    const smallerOrEqual = renderedLevels.filter(l => l <= user.level);
    if (smallerOrEqual.length > 0) {
      targetLvl = Math.max(...smallerOrEqual);
    } else if (renderedLevels.length > 0) {
      targetLvl = renderedLevels[0];
    }

    const element = levelNodesRefs.current[targetLvl];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  useEffect(() => {
    // Set default selected level to user's current level (if it has rewards)
    const initialLvl = user.level > 1 ? user.level : 5;
    setSelectedLevel(initialLvl);
    
    // Delay slightly to allow rendering before scrolling
    const timer = setTimeout(() => {
      scrollToMyLevel();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const selectedLevelRewards = rewardsByLevel[selectedLevel] || [];

  return (
    <section className="screen rewards-path-screen">
      <div className="topline">
        <div>
          <p className="eyebrow">Interactive Journey</p>
          <h1>Rewards Progression Path</h1>
        </div>
        <div className="topline-actions">
          <button className="secondary compact" onClick={scrollToMyLevel}>
            <Navigation size={18} /> Jump to My Level (Lvl {user.level})
          </button>
          <button className="primary compact" onClick={goTrain}>
            <Sparkles size={18} /> Earn XP
          </button>
        </div>
      </div>

      {/* Level Summary Dashboard Card */}
      <div className="path-hero-dashboard">
        <div className="path-hero-left">
          <div className="level-circle-badge">
            <span className="lvl-num">{user.level}</span>
            <span className="lvl-lbl">Level</span>
          </div>
          <div className="path-hero-info">
            <h2>Road Progress: {Math.round(progressPercent)}%</h2>
            <p>You have unlocked {rewardPath.filter(r => r.level <= user.level).length} rewards along the level road.</p>
            <div className="road-overall-bar">
              <div className="road-overall-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>
        
        <div className="path-hero-right">
          {nextMilestone ? (
            <div className="next-milestone-panel">
              <span className="panel-tag">Next Major Milestone</span>
              <strong>Level {nextMilestone.level} ({nextMilestone.levelsLeft} levels to go)</strong>
              <p>Reward: <span className="highlight-text">{nextMilestone.rewardName}</span></p>
            </div>
          ) : (
            <div className="next-milestone-panel completed">
              <strong>Grandmaster Road Cleared!</strong>
              <p>You've unlocked all milestone rewards up to level {maxRoadLevel}.</p>
            </div>
          )}
        </div>
      </div>

      <div className="rewards-path-layout">
        {/* Left Column: Winding/Linear Progress Road */}
        <div className="path-timeline-container">
          <div className="timeline-controls">
            <h2>Milestone Path (Level 2 - {maxRoadLevel})</h2>
            <div className="filter-toggle">
              <button 
                className={filterMilestones ? "active" : ""} 
                onClick={() => setFilterMilestones(true)}
              >
                Milestones Only
              </button>
              <button 
                className={!filterMilestones ? "active" : ""} 
                onClick={() => setFilterMilestones(false)}
              >
                Show All Levels
              </button>
            </div>
          </div>

          <div className="timeline-wrapper">
            {/* The vertical progress line */}
            <div className="timeline-progress-line">
              <div 
                className="timeline-progress-fill" 
                style={{ height: `${progressPercent}%` }}
              />
            </div>

            {/* List of nodes */}
            <div className="timeline-nodes-list">
              {levels.map((item) => {
                const isSelected = selectedLevel === item.level;
                
                return (
                  <div 
                    key={item.level} 
                    ref={el => levelNodesRefs.current[item.level] = el}
                    className={`timeline-node-row ${item.isUnlocked ? "unlocked" : "locked"} ${isSelected ? "selected" : ""} ${item.isMilestone ? "milestone-row" : ""}`}
                    onClick={() => setSelectedLevel(item.level)}
                  >
                    {/* Node Dot indicator */}
                    <div className="node-dot-wrapper">
                      <div className={`node-dot ${item.isUnlocked ? "glow" : ""}`}>
                        {item.isUnlocked ? <Check size={14} /> : <Lock size={12} />}
                      </div>
                    </div>

                    {/* Level details card */}
                    <div className="node-content-card">
                      <div className="node-card-header">
                        <span className="node-level">Level {item.level}</span>
                        {item.isMilestone && <span className="milestone-badge"><Trophy size={12} /> Milestone</span>}
                      </div>
                      
                      <div className="node-rewards-preview">
                        {item.rewards.map((reward) => (
                          <span key={reward.id} className={`preview-badge rarity-${reward.rarity.toLowerCase()}`}>
                            {reward.category === "cosmetic" && <Award size={12} />}
                            {reward.category === "consumable" && <Zap size={12} />}
                            {reward.type === "shard" && <Star size={12} />}
                            {reward.name.split(" ")[0]} {reward.type === "xp_multiplier" ? "Boost" : reward.type}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Reward Preview Details */}
        <div className="reward-preview-sidebar">
          <div className="sticky-sidebar-content">
            <div className="sidebar-header">
              <Gift size={24} className="gift-icon" />
              <div>
                <h2>Level {selectedLevel} Rewards</h2>
                <p>{user.level >= selectedLevel ? "Unlocked & Claimed" : "Locked (Requires Level " + selectedLevel + ")"}</p>
              </div>
            </div>

            <div className="sidebar-rewards-list">
              {selectedLevelRewards.length > 0 ? (
                selectedLevelRewards.map((reward) => (
                  <article key={reward.id} className={`reward-detail-card rarity-${reward.rarity.toLowerCase()}`}>
                    <div className="reward-detail-header">
                      {reward.type === "shard" ? (
                        <div className="shard-thumbnail">
                          <img src={shardImageForReward(reward)} alt={reward.name} />
                        </div>
                      ) : (
                        <div className="reward-detail-icon">
                          {reward.category === "cosmetic" ? <Award size={20} /> : <Zap size={20} />}
                        </div>
                      )}
                      
                      <div className="reward-detail-title-wrap">
                        <h3>{reward.name}</h3>
                        <span className="rarity-tag">{reward.rarity}</span>
                      </div>
                    </div>

                    <p className="reward-detail-desc">{reward.description}</p>
                    
                    <div className="reward-detail-footer">
                      <span className="category-tag">{reward.category}</span>
                      {reward.type === "xp_multiplier" && (
                        <span className="boost-spec">{reward.multiplier}x for {reward.durationMinutes} mins</span>
                      )}
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty-sidebar-state">
                  <p>Select a level on the roadmap to preview its milestone rewards.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
