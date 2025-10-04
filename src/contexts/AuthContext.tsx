'use client'

import { createContext, useContext, useEffect, useState } from "react";
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
  const [user, setUser] = useState<User | null>(() => {
    // Initialize with mock user immediately to prevent redirect loops
    return {
      id: 'test-user-123',
      email: 'test@example.com',
      aud: 'authenticated',
      role: 'authenticated',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: {},
      identities: [],
      factors: []
    }
  });
  const [loading, setLoading] = useState(false); // No loading needed for mock auth

  useEffect(() => {
    // Set the auth cookie for API authentication
    document.cookie = `auth-token=test-user-123; path=/; max-age=86400`
  }, []);

  const signIn = async (email: string, password: string) => {
    // Mock sign in - always succeeds
    const mockUser: User = {
      id: 'test-user-123',
      email: email,
      aud: 'authenticated',
      role: 'authenticated',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: {},
      identities: [],
      factors: []
    }
    
    setUser(mockUser)
    document.cookie = `auth-token=test-user-123; path=/; max-age=86400`
    return { error: null }
  };

  const signUp = async (email: string, password: string) => {
    // Mock sign up - always succeeds
    return { error: null };
  };

  const signInWithProvider = async (provider: 'google' | 'facebook') => {
    // Mock provider sign in - always succeeds
    return { error: null };
  };

  const signOut = async () => {
    setUser(null);
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  };

  const refreshUser = async () => {
    // Keep the mock user
    const mockUser: User = {
      id: 'test-user-123',
      email: 'test@example.com',
      aud: 'authenticated',
      role: 'authenticated',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: {},
      identities: [],
      factors: []
    }
    setUser(mockUser)
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