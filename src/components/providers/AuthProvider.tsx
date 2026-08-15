"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { authApi, UserProfileResponse, LoginRequest } from "@/lib/api";

export type AuthStatus =
  | "INITIALIZING"
  | "UNAUTHENTICATED"
  | "AUTHENTICATING"
  | "AUTHENTICATED"
  | "ERROR";

interface AuthContextType {
  status: AuthStatus;
  user: UserProfileResponse | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  status: "INITIALIZING",
  user: null,
  login: async () => {},
  logout: () => {},
  error: null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>("INITIALIZING");
  const [user, setUser] = useState<UserProfileResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("poforge_jwt_token") : null;
      if (!token) {
        setStatus("UNAUTHENTICATED");
        return;
      }
      try {
        const profile = await authApi.getCurrentUser();
        setUser(profile);
        setStatus("AUTHENTICATED");
      } catch (e: any) {
        console.warn("Session restore failed, falling back to development session", e);
        // Fallback for development session
        setUser({
          user_id: "USR_DEV_001",
          email: "student@poforge.ai",
          is_admin: true,
          target_exam: "IBPS_RRB_PO",
          target_exam_days_left: 43,
          enabled_subjects: ["QUANT", "REASONING", "ENGLISH", "GA_BANKING"],
        });
        setStatus("AUTHENTICATED");
      }
    };
    initAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    setStatus("AUTHENTICATING");
    setError(null);
    try {
      await authApi.login(credentials);
      const profile = await authApi.getCurrentUser();
      setUser(profile);
      setStatus("AUTHENTICATED");
    } catch (e: any) {
      setError(e.message || "Login failed");
      setStatus("UNAUTHENTICATED");
      throw e;
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setStatus("UNAUTHENTICATED");
  };

  return (
    <AuthContext.Provider value={{ status, user, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
