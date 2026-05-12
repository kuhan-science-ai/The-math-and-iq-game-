import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { api } from "../lib/api.js";
import { firebaseAuth, googleProvider } from "../lib/firebase.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("brainBoostToken");
    if (!token) {
      setLoading(false);
      return;
    }

    api("/user/profile")
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem("brainBoostToken"))
      .finally(() => setLoading(false));
  }, []);

  const register = async (payload) => {
    const data = await api("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    localStorage.setItem("brainBoostToken", data.token);
    setUser(data.user);
  };

  const login = async (payload) => {
    const data = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    localStorage.setItem("brainBoostToken", data.token);
    setUser(data.user);
  };

  const loginWithGoogle = async () => {
    if (!firebaseAuth) {
      throw new Error("Firebase web config is missing. Add VITE_FIREBASE_* variables in Render.");
    }

    const result = await signInWithPopup(firebaseAuth, googleProvider);
    const firebaseToken = await result.user.getIdToken();
    const data = await api("/auth/google", {
      method: "POST",
      body: JSON.stringify({ firebaseToken })
    });

    if (data.needsUsername) {
      return { needsUsername: true, firebaseToken, email: data.email, suggestedName: data.suggestedName };
    }

    localStorage.setItem("brainBoostToken", data.token);
    setUser(data.user);
    return { needsUsername: false };
  };

  const completeGoogleProfile = async ({ firebaseToken, name }) => {
    const data = await api("/auth/google", {
      method: "POST",
      body: JSON.stringify({ firebaseToken, name })
    });

    localStorage.setItem("brainBoostToken", data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("brainBoostToken");
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, setUser, loading, register, login, loginWithGoogle, completeGoogleProfile, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
