'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from './client';
import { isSupabaseConfigured } from './utils';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
}

const noopAuth: AuthContextType = {
  user: null,
  session: null,
  loading: false,
  configured: false,
  signIn: async () => ({ error: 'Supabase 未配置，请设置环境变量 NEXT_PUBLIC_SUPABASE_URL' }),
  signUp: async () => ({ error: 'Supabase 未配置' }),
  signOut: async () => {},
  signInWithGitHub: async () => {},
};

const AuthContext = createContext<AuthContextType>(noopAuth);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Skip entire Supabase initialization if not configured
  if (!isSupabaseConfigured()) {
    return <AuthContext.Provider value={noopAuth}>{children}</AuthContext.Provider>;
  }

  // Supabase is configured — normal flow
  return <AuthProviderInner>{children}</AuthProviderInner>;
}

function AuthProviderInner({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  }, [supabase]);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    return {};
  }, [supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, [supabase]);

  const signInWithGitHub = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, session, loading, configured: true, signIn, signUp, signOut, signInWithGitHub }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
