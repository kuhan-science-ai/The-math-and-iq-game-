import { Brain, ChartNoAxesCombined, Gift, LogOut, Medal, Sparkles, UserRound } from "lucide-react";
import React from "react";
import { useState } from "react";
import { useAuth } from "./context/AuthContext.jsx";
import { AuthPage } from "./pages/AuthPage.jsx";
import { CheatConsole } from "./components/CheatConsole.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { GameArena } from "./pages/GameArena.jsx";
import { Leaderboard } from "./pages/Leaderboard.jsx";
import { Profile } from "./pages/Profile.jsx";
import { ProgressionHub } from "./pages/ProgressionHub.jsx";
import { Rewards } from "./pages/Rewards.jsx";

export const App = () => {
  const { user, loading, logout } = useAuth();
  const [view, setView] = useState("dashboard");
  const [pendingClaimRewards, setPendingClaimRewards] = useState([]);

  const claimRequired = pendingClaimRewards.length > 0;
  const navigate = (nextView) => {
    setView(claimRequired ? "rewards" : nextView);
  };

  const queueRewardClaim = (rewards = []) => {
    if (!rewards.length) return;
    setPendingClaimRewards(rewards);
    setView("rewards");
  };

  if (loading) {
    return <main className="boot">Charging neurons...</main>;
  }

  if (!user) return <AuthPage />;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark"><Brain size={24} /></span>
          <div>
            <strong>Brain Boost</strong>
            <small>Aptitude & Speed</small>
          </div>
        </div>

        <nav>
          <button className={view === "dashboard" ? "active" : ""} onClick={() => navigate("dashboard")}>
            <UserRound size={18} /> Dashboard
          </button>
          <button className={view === "profile" ? "active" : ""} onClick={() => navigate("profile")}>
            <UserRound size={18} /> Profile
          </button>
          <button className={view === "games" ? "active" : ""} onClick={() => navigate("games")}>
            <ChartNoAxesCombined size={18} /> Training
          </button>
          <button className={view === "rewards" ? "active" : ""} onClick={() => setView("rewards")}>
            <Gift size={18} /> Rewards
          </button>
          <button className={view === "progression" ? "active" : ""} onClick={() => navigate("progression")}>
            <Sparkles size={18} /> Progression
          </button>
          <button className={view === "leaderboard" ? "active" : ""} onClick={() => navigate("leaderboard")}>
            <Medal size={18} /> Leaderboard
          </button>
        </nav>

        <button className="ghost logout" onClick={logout}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      <main className="main-panel">
        {view === "dashboard" && <Dashboard goTrain={() => navigate("games")} goRewards={() => setView("rewards")} />}
        {view === "profile" && <Profile />}
        {view === "games" && <GameArena onRewardClaimRequired={queueRewardClaim} />}
        {view === "rewards" && (
          <Rewards
            goTrain={() => navigate("games")}
            pendingClaimRewards={pendingClaimRewards}
            claimRequired={claimRequired}
            onClaimRewards={() => setPendingClaimRewards([])}
          />
        )}
        {view === "progression" && <ProgressionHub goTrain={() => navigate("games")} goRewards={() => setView("rewards")} />}
        {view === "leaderboard" && <Leaderboard />}
      </main>
      <CheatConsole />
    </div>
  );
};
