import { Award, Check, Crown, Gem, Gift, Lock, Navigation, Shield, Sparkles, Star, Trophy, Zap } from "lucide-react";
import React, { useMemo, useState, useEffect, useRef } from "react";
import amethystShard from "../assets/reward-shards/amethyst-derivative-shard.png";
import citrineShard from "../assets/reward-shards/citrine-integral-shard.png";
import diamondShard from "../assets/reward-shards/diamond-pythagorean-shard.png";
import emeraldShard from "../assets/reward-shards/emerald-nabla-shard.png";
import topazShard from "../assets/reward-shards/topaz-sigma-shard.png";
import { useAuth } from "../context/AuthContext.jsx";
import { rewardPath } from "../lib/rewards.js";

/* ─── helpers ─────────────────────────────────────────────────────────────── */

const shardImageForReward = (reward = {}) => {
  const key = String(reward.gem || reward.color || reward.name || "").toLowerCase();
  if (key.includes("amethyst")) return amethystShard;
  if (key.includes("emerald"))  return emeraldShard;
  if (key.includes("topaz") || key.includes("sapphire")) return topazShard;
  if (key.includes("ruby") || key.includes("citrine"))   return citrineShard;
  return diamondShard;
};

/* ─── 3-D CSS reward model ────────────────────────────────────────────────── */

const RARITY_HUE = {
  common: "#a9b7d6", rare: "#43d7ff", epic: "#9d63ff",
  legendary: "#ffb84d", mythic: "#ff5ea8",
  ascendant: "#ba55d3", grandmaster: "#ffd700", legend: "#fff"
};

const Model3D = ({ reward }) => {
  if (!reward) return null;
  const r = reward.rarity?.toLowerCase() || "common";
  const col = RARITY_HUE[r] || "#a9b7d6";

  if (reward.type === "token") {
    return (
      <div className="model3d coin-model" style={{ "--col": col }}>
        <div className="coin-face front"><Star size={20} /></div>
        <div className="coin-edge" />
        <div className="coin-face back"><Star size={20} /></div>
      </div>
    );
  }

  if (reward.type === "badge") {
    return (
      <div className="model3d badge-model" style={{ "--col": col }}>
        <div className="badge-shape">
          <Shield size={22} />
        </div>
        <div className="badge-shine" />
      </div>
    );
  }

  if (reward.type === "emblem" || reward.type === "crest") {
    return (
      <div className="model3d emblem-model" style={{ "--col": col }}>
        <div className="emblem-hex">
          <Award size={20} />
        </div>
        <div className="emblem-glow" />
      </div>
    );
  }

  if (reward.type === "crown" || reward.type === "trophy") {
    return (
      <div className="model3d crown-model" style={{ "--col": col }}>
        <div className="crown-body">
          <Crown size={22} />
        </div>
        <div className="crown-gems">
          <span /><span /><span />
        </div>
      </div>
    );
  }

  if (reward.type === "frame" || reward.type === "card") {
    return (
      <div className="model3d frame-model" style={{ "--col": col }}>
        <div className="frame-outer">
          <div className="frame-inner">
            <Gem size={16} />
          </div>
        </div>
        <div className="frame-corner tl" /><div className="frame-corner tr" />
        <div className="frame-corner bl" /><div className="frame-corner br" />
      </div>
    );
  }

  if (reward.type === "aura" || reward.type === "trail") {
    return (
      <div className="model3d aura-model" style={{ "--col": col }}>
        <div className="aura-ring r1" />
        <div className="aura-ring r2" />
        <div className="aura-ring r3" />
        <div className="aura-core"><Sparkles size={16} /></div>
      </div>
    );
  }

  // Generic collectible / shard (non-rotating version shown in sidebar list)
  return (
    <div className="model3d generic-model" style={{ "--col": col }}>
      <div className="generic-gem"><Gift size={20} /></div>
    </div>
  );
};

/* ─── Rotating shard with sparkles ───────────────────────────────────────── */

const SparklingShardCard = ({ reward }) => {
  const [active, setActive] = useState(false);
  const src = shardImageForReward(reward);
  const r = reward.rarity?.toLowerCase() || "common";
  const col = RARITY_HUE[r] || "#a9b7d6";

  return (
    <div
      className={`sparkling-shard-wrap ${active ? "spinning" : ""}`}
      style={{ "--col": col }}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
    >
      {/* sparkle particles */}
      {active && Array.from({ length: 10 }, (_, i) => (
        <span key={i} className="sparkle-particle" style={{ "--i": i }} />
      ))}
      <div className="shard-3d-inner">
        <img src={src} alt={reward.name} className="shard-3d-img" />
        <div className="shard-reflection" />
      </div>
    </div>
  );
};

/* ─── Main page ───────────────────────────────────────────────────────────── */

const MAX_ROAD = 200;
const BRACKETS = [
  { label: "Lv 1–50",    min: 2,   max: 50  },
  { label: "Lv 51–100",  min: 51,  max: 100 },
  { label: "Lv 101–150", min: 101, max: 150 },
  { label: "Lv 151–200", min: 151, max: 200 },
];

export const RewardsPath = ({ goTrain }) => {
  const { user } = useAuth();
  const [filterMilestones, setFilterMilestones] = useState(true);
  const [selectedLevel,    setSelectedLevel]    = useState(null);
  const [bracket,          setBracket]          = useState(0);   // index into BRACKETS
  const levelNodesRefs = useRef({});

  /* group all 200 levels */
  const rewardsByLevel = useMemo(() => {
    const g = {};
    rewardPath.forEach(r => {
      g[r.level] = g[r.level] ? [...g[r.level], r] : [r];
    });
    return g;
  }, []);

  const { min: bMin, max: bMax } = BRACKETS[bracket];

  /* auto-select bracket that contains user's level */
  useEffect(() => {
    const idx = BRACKETS.findIndex(b => user.level >= b.min && user.level <= b.max);
    if (idx >= 0) setBracket(idx);
  }, [user.level]);

  const levels = useMemo(() => {
    const list = [];
    for (let i = bMin; i <= bMax; i++) {
      if (!rewardsByLevel[i]?.length) continue;
      if (filterMilestones && i % 5 !== 0 && i !== bMin) continue;
      list.push({
        level:       i,
        rewards:     rewardsByLevel[i],
        isMilestone: i % 5 === 0,
        isUnlocked:  user.level >= i,
      });
    }
    return list;
  }, [rewardsByLevel, filterMilestones, user.level, bMin, bMax]);

  /* progress % within the bracket */
  const progressPercent = useMemo(() => {
    if (user.level < bMin) return 0;
    if (user.level >= bMax) return 100;
    return ((user.level - bMin) / (bMax - bMin)) * 100;
  }, [user.level, bMin, bMax]);

  /* overall road progress across all 200 levels */
  const overallPercent = useMemo(() => {
    if (user.level <= 2) return 0;
    if (user.level >= MAX_ROAD) return 100;
    return ((user.level - 2) / (MAX_ROAD - 2)) * 100;
  }, [user.level]);

  /* next milestone */
  const nextMilestone = useMemo(() => {
    for (let i = user.level + 1; i <= MAX_ROAD; i++) {
      if (i % 5 === 0) {
        const rewards  = rewardsByLevel[i] || [];
        const cosmetic = rewards.find(r => r.category === "cosmetic");
        const shard    = rewards.find(r => r.type === "shard");
        return {
          level:      i,
          levelsLeft: i - user.level,
          rewardName: cosmetic?.name ?? shard?.name ?? "Milestone Rewards",
        };
      }
    }
    return null;
  }, [user.level, rewardsByLevel]);

  const scrollToMyLevel = () => {
    const rendered = levels.map(l => l.level);
    const candidates = rendered.filter(l => l <= user.level);
    const target = candidates.length ? Math.max(...candidates) : rendered[0];
    levelNodesRefs.current[target]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  useEffect(() => {
    const initialLvl = user.level > 1 ? user.level : bMin;
    setSelectedLevel(initialLvl);
    const t = setTimeout(scrollToMyLevel, 400);
    return () => clearTimeout(t);
  }, [bracket]);

  const selectedLevelRewards = rewardsByLevel[selectedLevel] || [];

  return (
    <section className="screen rewards-path-screen">
      {/* ── Header ─────────────────────────────── */}
      <div className="topline">
        <div>
          <p className="eyebrow">Interactive Journey</p>
          <h1>Rewards Progression Path</h1>
        </div>
        <div className="topline-actions">
          <button className="secondary compact" onClick={scrollToMyLevel}>
            <Navigation size={18} /> Jump to Lv {user.level}
          </button>
          <button className="primary compact" onClick={goTrain}>
            <Sparkles size={18} /> Earn XP
          </button>
        </div>
      </div>

      {/* ── Hero card ──────────────────────────── */}
      <div className="path-hero-dashboard">
        <div className="path-hero-left">
          <div className="level-circle-badge">
            <span className="lvl-num">{user.level}</span>
            <span className="lvl-lbl">Level</span>
          </div>
          <div className="path-hero-info">
            <h2>Overall Road: {Math.round(overallPercent)}% of 200</h2>
            <p>
              {rewardPath.filter(r => r.level <= user.level).length} / {rewardPath.length} total rewards
              unlocked across all 200 levels.
            </p>
            <div className="road-overall-bar">
              <div className="road-overall-fill" style={{ width: `${overallPercent}%` }} />
            </div>
          </div>
        </div>
        <div className="path-hero-right">
          {nextMilestone ? (
            <div className="next-milestone-panel">
              <span className="panel-tag">Next Major Milestone</span>
              <strong>Level {nextMilestone.level} ({nextMilestone.levelsLeft} levels away)</strong>
              <p>Reward: <span className="highlight-text">{nextMilestone.rewardName}</span></p>
            </div>
          ) : (
            <div className="next-milestone-panel completed">
              <strong>Legend Road Complete!</strong>
              <p>All 200 levels unlocked. You are a Grandmaster.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Bracket tabs ───────────────────────── */}
      <div className="bracket-tabs">
        {BRACKETS.map((b, idx) => {
          const pct = Math.min(100, Math.max(0,
            ((user.level - b.min) / (b.max - b.min)) * 100
          ));
          const done  = user.level >= b.max;
          const reach = user.level >= b.min;
          return (
            <button
              key={idx}
              className={`bracket-tab ${bracket === idx ? "active" : ""} ${done ? "done" : reach ? "partial" : ""}`}
              onClick={() => setBracket(idx)}
            >
              <span className="bracket-label">{b.label}</span>
              <div className="bracket-mini-bar">
                <div className="bracket-mini-fill" style={{ width: `${pct}%` }} />
              </div>
              {done && <span className="bracket-done-check"><Check size={11} /></span>}
            </button>
          );
        })}
      </div>

      {/* ── Two-column layout ──────────────────── */}
      <div className="rewards-path-layout">

        {/* Left — timeline */}
        <div className="path-timeline-container">
          <div className="timeline-controls">
            <h2>Level Road ({BRACKETS[bracket].label})</h2>
            <div className="filter-toggle">
              <button className={filterMilestones ? "active" : ""} onClick={() => setFilterMilestones(true)}>
                Milestones Only
              </button>
              <button className={!filterMilestones ? "active" : ""} onClick={() => setFilterMilestones(false)}>
                All Levels
              </button>
            </div>
          </div>

          <div className="timeline-wrapper">
            <div className="timeline-progress-line">
              <div className="timeline-progress-fill" style={{ height: `${progressPercent}%` }} />
            </div>

            <div className="timeline-nodes-list">
              {levels.map((item) => {
                const isSelected = selectedLevel === item.level;
                return (
                  <div
                    key={item.level}
                    ref={el => levelNodesRefs.current[item.level] = el}
                    className={`timeline-node-row
                      ${item.isUnlocked ? "unlocked" : "locked"}
                      ${isSelected ? "selected" : ""}
                      ${item.isMilestone ? "milestone-row" : ""}`}
                    onClick={() => setSelectedLevel(item.level)}
                  >
                    <div className="node-dot-wrapper">
                      <div className={`node-dot ${item.isUnlocked ? "glow" : ""}`}>
                        {item.isUnlocked ? <Check size={14} /> : <Lock size={12} />}
                      </div>
                    </div>

                    <div className="node-content-card">
                      <div className="node-card-header">
                        <span className="node-level">Level {item.level}</span>
                        {item.isMilestone && (
                          <span className="milestone-badge"><Trophy size={12} /> Milestone</span>
                        )}
                      </div>
                      <div className="node-rewards-preview">
                        {item.rewards.map(reward => (
                          <span
                            key={reward.id}
                            className={`preview-badge rarity-${reward.rarity.toLowerCase()}`}
                          >
                            {reward.type === "token"        && <Star  size={11} />}
                            {reward.category === "cosmetic" && <Award size={11} />}
                            {reward.type === "shard"        && <Gem   size={11} />}
                            {reward.type === "xp_multiplier"&& <Zap   size={11} />}
                            {reward.name.split(" ").slice(0, 2).join(" ")}
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

        {/* Right — preview sidebar */}
        <div className="reward-preview-sidebar">
          <div className="sticky-sidebar-content">
            <div className="sidebar-header">
              <Gift size={24} className="gift-icon" />
              <div>
                <h2>Level {selectedLevel} Rewards</h2>
                <p>
                  {selectedLevel && user.level >= selectedLevel
                    ? "✓ Unlocked & Claimed"
                    : `Locked — reach Level ${selectedLevel}`}
                </p>
              </div>
            </div>

            <div className="sidebar-rewards-list">
              {selectedLevelRewards.length > 0 ? (
                selectedLevelRewards.map(reward => (
                  <article key={reward.id} className={`reward-detail-card rarity-${reward.rarity.toLowerCase()}`}>

                    {/* 3-D model or shard */}
                    <div className="reward-3d-showcase">
                      {reward.type === "shard"
                        ? <SparklingShardCard reward={reward} />
                        : reward.type !== "xp_multiplier"
                          ? <Model3D reward={reward} />
                          : (
                            <div className="xp-boost-icon">
                              <Zap size={28} />
                              <span>{reward.multiplier}x</span>
                            </div>
                          )
                      }
                    </div>

                    <div className="reward-detail-header">
                      <div className="reward-detail-title-wrap">
                        <h3>{reward.name}</h3>
                        <span className="rarity-tag">{reward.rarity}</span>
                      </div>
                    </div>

                    <p className="reward-detail-desc">{reward.description}</p>

                    <div className="reward-detail-footer">
                      <span className="category-tag">{reward.category}</span>
                      {reward.type === "xp_multiplier" && (
                        <span className="boost-spec">{reward.multiplier}x · {reward.durationMinutes} min</span>
                      )}
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty-sidebar-state">
                  <p>Click any level on the roadmap to preview its rewards.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
