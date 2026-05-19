import { BadgeCheck, Crown, Sparkles, UserRound, X } from "lucide-react";
import React from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../lib/api.js";

const cosmeticSlots = ["badge", "emblem", "crown", "frame", "card", "trail", "crest", "aura", "trophy"];

export const Profile = () => {
  const { user, setUser } = useAuth();
  const earnedRewards = user.earnedRewards || user.rewards || [];
  const cosmetics = earnedRewards.filter((reward) => reward.category === "cosmetic");

  const equip = async (reward) => {
    const data = await api("/user/rewards/equip", {
      method: "POST",
      body: JSON.stringify({ rewardId: reward.id })
    });
    setUser(data.user);
  };

  const clearSlot = async (slot) => {
    const data = await api("/user/rewards/equip", {
      method: "POST",
      body: JSON.stringify({ slot, clear: true })
    });
    setUser(data.user);
  };

  return (
    <section className="screen">
      <div className="topline">
        <div>
          <p className="eyebrow">Profile tab</p>
          <h1>Show-off loadout</h1>
        </div>
      </div>

      <div className={`profile-showcase ${user.equippedRewards?.aura ? "has-aura" : ""} ${user.equippedRewards?.frame ? "has-frame" : ""}`}>
        <div className="showcase-avatar">
          <UserRound size={44} />
          {user.equippedRewards?.badge && <span className="avatar-badge"><BadgeCheck size={18} /></span>}
        </div>
        <div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <strong>Level {user.level}</strong>
        </div>
        <div className="equipped-strip">
          {cosmeticSlots.map((slot) => {
            const reward = user.equippedRewards?.[slot];
            return (
              <span key={slot} className={reward ? "equipped-pill active" : "equipped-pill"}>
                {reward ? reward.name : slot}
              </span>
            );
          })}
        </div>
      </div>

      <div className="section-title">
        <h2>Equipped cosmetics</h2>
        <span>These appear on your profile showcase</span>
      </div>

      <div className="equip-grid">
        {cosmeticSlots.map((slot) => {
          const reward = user.equippedRewards?.[slot];
          return (
            <article className="equip-slot" key={slot}>
              <small>{slot}</small>
              <strong>{reward?.name || "Empty"}</strong>
              {reward && <button className="secondary compact" onClick={() => clearSlot(slot)}><X size={16} /> Clear</button>}
            </article>
          );
        })}
      </div>

      <div className="section-title">
        <h2>Cosmetic inventory</h2>
        <span>Equip unlocked emblems, frames, crowns, aura, and trophies</span>
      </div>

      <div className="earned-grid">
        {cosmetics.length ? (
          cosmetics.map((reward) => {
            const equipped = user.equippedRewards?.[reward.equipSlot || reward.type]?.id === reward.id;
            return (
              <article className="earned-card" key={reward.id}>
                <div className="reward-icon"><Crown size={22} /></div>
                <div>
                  <h3>{reward.name}</h3>
                  <p>{reward.description}</p>
                  <small>{reward.rarity} · {reward.equipSlot || reward.type}</small>
                </div>
                <button className={equipped ? "secondary compact" : "primary compact"} disabled={equipped} onClick={() => equip(reward)}>
                  <Sparkles size={16} /> {equipped ? "Equipped" : "Equip"}
                </button>
              </article>
            );
          })
        ) : (
          <div className="empty-state">No cosmetic rewards yet. Milestone levels unlock profile items.</div>
        )}
      </div>
    </section>
  );
};
