import React, { useEffect, useState } from "react";
import { Terminal, X } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../lib/api.js";

const examples = ["level-up", "level-down", "xp-up", "xp-down", "set-level-25", "set-xp-5000", "xp+1000", "xp-500"];

export const CheatConsole = ({ onRewardClaimRequired }) => {
  const { user, setUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [levelValue, setLevelValue] = useState("");
  const [xpValue, setXpValue] = useState("");
  const [message, setMessage] = useState("Press Ctrl+Alt+C to toggle.");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.ctrlKey && event.altKey && event.key.toLowerCase() === "c") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const runCheat = async (payload) => {
    setBusy(true);
    setMessage("Running cheat...");
    try {
      const data = await api("/user/cheat", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      setUser(data.user);
      if (data.leveledUp && data.newRewards?.length) onRewardClaimRequired?.(data.newRewards);
      setMessage(data.message);
      setCode("");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!code.trim()) return;
    await runCheat({ code });
  };

  const runAction = (action, value) => {
    if (value === "" || value == null) {
      setMessage("Enter a value first.");
      return;
    }
    runCheat({ action, value: Number(value) });
  };

  if (!open) return null;

  return (
    <section className="cheat-console" aria-label="Cheat code console">
      <div className="cheat-header">
        <span><Terminal size={16} /> Cheat console</span>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close cheat console"><X size={16} /></button>
      </div>
      <form onSubmit={submit} className="cheat-row">
        <input
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Enter cheat code"
          autoFocus
        />
        <button className="primary" disabled={busy}>{busy ? "..." : "Run"}</button>
      </form>
      <div className="cheat-manual">
        <label>
          <span>Manual level</span>
          <div className="cheat-row">
            <input
              type="number"
              min="1"
              max="50"
              value={levelValue}
              onChange={(event) => setLevelValue(event.target.value)}
              placeholder={String(user?.level || 1)}
            />
            <button className="secondary" type="button" disabled={busy} onClick={() => runAction("set-level", levelValue)}>Set</button>
          </div>
        </label>
        <label>
          <span>Manual XP</span>
          <div className="cheat-row">
            <input
              type="number"
              min="0"
              value={xpValue}
              onChange={(event) => setXpValue(event.target.value)}
              placeholder={String(user?.xp || 0)}
            />
            <button className="secondary" type="button" disabled={busy} onClick={() => runAction("set-xp", xpValue)}>Set</button>
            <button className="secondary" type="button" disabled={busy} onClick={() => runAction("add-xp", xpValue)}>Add</button>
            <button
              className="secondary"
              type="button"
              disabled={busy}
              onClick={() => xpValue === "" ? setMessage("Enter an XP amount first.") : runAction("add-xp", -Number(xpValue))}
            >
              Remove
            </button>
          </div>
        </label>
      </div>
      <p>{message}</p>
      <div className="cheat-examples">
        {examples.map((example) => <button key={example} type="button" onClick={() => setCode(example)}>{example}</button>)}
      </div>
    </section>
  );
};
