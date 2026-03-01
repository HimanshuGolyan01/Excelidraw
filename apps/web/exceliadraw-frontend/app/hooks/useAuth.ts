"use client";

import { useState, useEffect } from "react";

function getUserIdFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId ?? null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    let u = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    if (!u && t) {
      u = getUserIdFromToken(t);
      if (u) localStorage.setItem("userId", u);
    }
    setToken(t);
    setUserId(u);
  }, []);

  const login = (newToken: string, newUserId?: string) => {
    localStorage.setItem("token", newToken);
    const u = newUserId ?? getUserIdFromToken(newToken);
    if (u) localStorage.setItem("userId", u);
    setToken(newToken);
    setUserId(u);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setToken(null);
    setUserId(null);
  };

  return { token, userId, login, logout };
}
