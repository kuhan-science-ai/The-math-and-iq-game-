import { Brain, ChartNoAxesCombined, LogOut, Medal, UserRound } from "lucide-react";
import React from "react";
import { useState } from "react";
import { useAuth } from "./context/AuthContext.jsx";
import { AuthPage } from "./pages/AuthPage.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { GameArena } from "./pages/GameArena.jsx";
import { Leaderboard } from "./pages/Leaderboard.jsx";

export const App = () => {
  const { user, loading, logout } = useAuth();
  const [view, setView] = useState("dashboard");

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
          <button className={view === "dashboard" ? "active" : ""} onClick={() => setView("dashboard")}>
            <UserRound size={18} /> Dashboard
          </button>
          <button className={view === "games" ? "active" : ""} onClick={() => setView("games")}>
            <ChartNoAxesCombined size={18} /> Training
          </button>
          <button className={view === "leaderboard" ? "active" : ""} onClick={() => setView("leaderboard")}>
            <Medal size={18} /> Leaderboard
          </button>
        </nav>

        <button className="ghost logout" onClick={logout}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      <main className="main-panel">
        {view === "dashboard" && <Dashboard goTrain={() => setView("games")} />}
        {view === "games" && <GameArena />}
        {view === "leaderboard" && <Leaderboard />}
      </main>
    </div>
  );
};
