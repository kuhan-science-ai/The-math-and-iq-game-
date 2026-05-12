import { Medal } from "lucide-react";
import React from "react";
import { useEffect, useState } from "react";
import { api, modes } from "../lib/api.js";

export const Leaderboard = () => {
  const [mode, setMode] = useState("speedMath");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api(`/leaderboard?mode=${mode}`).then((data) => setRows(data.leaderboard));
  }, [mode]);

  return (
    <section className="screen">
      <div className="topline">
        <div>
          <p className="eyebrow">Global rankings</p>
          <h1>Leaderboard</h1>
        </div>
        <div className="mode-tabs">
          {Object.entries(modes).map(([key, label]) => (
            <button key={key} className={mode === key ? "active" : ""} onClick={() => setMode(key)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="leaderboard">
        <div className="rank-row head">
          <span>Rank</span><span>Player</span><span>Score</span><span>Accuracy</span><span>Reaction</span>
        </div>
        {rows.length ? rows.map((row, index) => (
          <div className="rank-row" key={`${row.userId}-${row.mode}`}>
            <span className="rank"><Medal size={16} /> #{index + 1}</span>
            <span>{row.name}</span>
            <strong>{row.score}</strong>
            <span>{Math.round(row.accuracy || 0)}%</span>
            <span>{row.reactionTime ? `${row.reactionTime}ms` : "-"}</span>
          </div>
        )) : (
          <div className="empty-state">No scores for this mode yet.</div>
        )}
      </div>
    </section>
  );
};
