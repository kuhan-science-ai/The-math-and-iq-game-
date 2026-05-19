import React, { useEffect, useState } from "react";
import { Terminal, X } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../lib/api.js";

const examples = ["level-up", "level-down", "xp-up", "xp-down", "set-level-25", "set-xp-5000", "xp+1000", "xp-500"];

export const CheatConsole = () => {
  const { setUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
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

  const submit = async (event) => {
    event.preventDefault();
    if (!code.trim()) return;

    setBusy(true);
    setMessage("Running cheat...");
    try {
      const data = await api("/user/cheat", {
        method: "POST",
        body: JSON.stringify({ code })
      });
      setUser(data.user);
      setMessage(data.message);
      setCode("");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
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
      <p>{message}</p>
      <div className="cheat-examples">
        {examples.map((example) => <button key={example} type="button" onClick={() => setCode(example)}>{example}</button>)}
      </div>
    </section>
  );
};
