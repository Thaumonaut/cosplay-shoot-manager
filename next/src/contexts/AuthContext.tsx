'use client'

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithProvider: (provider: 'google' | 'facebook') => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated via cookie
    fetch("/api/auth/me", { credentials: "include" })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      if (!data.session) {
        return { error: new Error("No session returned") };
      }

      // Send session to backend to set cookies
      const response = await fetch("/api/auth/set-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to set session");
      }

      const sessionData = await response.json();
      setUser(sessionData.user);
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error("Sign in failed") };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      // Note: User will need to confirm email before they can sign in
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error("Sign up failed") };
    }
  };

  const signInWithProvider = async (provider: 'google' | 'facebook') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error("Social sign in failed") };
    }
  };

  const signOut = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear server-side session
      await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include",
      });

      setUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
      // Force clear user state even if there's an error
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await fetch("/api/auth/me", { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Refresh user error:", error);
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signInWithProvider,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}