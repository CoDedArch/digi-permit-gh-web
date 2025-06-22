"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type UserRole = "applicant" | "review_officer" | "inspection_officer" | "admin";

type User = {
  user_id: string;
  onboarding: boolean;
  role: UserRole;
};

type AuthContextType = {
  user: User | null;
  authenticated: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  refetch: () => Promise<void>; // incase I want to manually re-check
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/auth/me", {
        credentials: "include", // Important for sending cookie
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!res.ok) throw new Error("Not authenticated");

      const data = await res.json();
      setUser({
        user_id: data.user_id,
        onboarding: data.onboarding,
        role: data.role,
      });
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = async () => {
    await fetch("http://localhost:8000/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authenticated: !!user,
        loading,
        logout,
        refetch: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
