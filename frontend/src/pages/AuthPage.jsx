import { Brain, Lock, Mail, User } from "lucide-react";
import React from "react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export const AuthPage = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (isRegister) await register(form);
      else await login({ email: form.email, password: form.password });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-layout">
      <section className="auth-hero">
        <div className="brand massive">
          <span className="brand-mark"><Brain size={34} /></span>
          <div>
            <strong>Brain Boost</strong>
            <small>Aptitude & Speed Training Platform</small>
          </div>
        </div>
        <h1>Train faster thinking with competitive daily drills.</h1>
        <p>Sharpen mental math, logic, reaction time, focus, and accuracy with XP, levels, streaks, and global rankings.</p>
        <div className="hero-stats">
          <span><b>4</b> game modes</span>
          <span><b>50</b> levels</span>
          <span><b>JWT</b> auth</span>
        </div>
      </section>

      <form className="auth-card" onSubmit={submit}>
        <div className="toggle">
          <button type="button" className={isRegister ? "active" : ""} onClick={() => setIsRegister(true)}>Sign up</button>
          <button type="button" className={!isRegister ? "active" : ""} onClick={() => setIsRegister(false)}>Login</button>
        </div>

        {isRegister && (
          <label>
            <span><User size={16} /> Username</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} minLength={2} required />
          </label>
        )}

        <label>
          <span><Mail size={16} /> Email</span>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </label>

        <label>
          <span><Lock size={16} /> Password</span>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={6} required />
        </label>

        {error && <p className="error">{error}</p>}
        <button className="primary" disabled={busy}>{busy ? "Syncing..." : isRegister ? "Create profile" : "Enter arena"}</button>
      </form>
    </main>
  );
};
