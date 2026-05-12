import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api.js";

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

  const logout = () => {
    localStorage.removeItem("brainBoostToken");
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, setUser, loading, register, login, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
