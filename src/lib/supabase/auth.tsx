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
  isAnonymous: boolean;
  linkEmail: (email: string) => Promise<{ error?: string }>;
}

const noopAuth: AuthContextType = {
  user: null,
  session: null,
  loading: false,
  configured: false,
  isAnonymous: false,
  linkEmail: async () => ({ error: 'Supabase 未配置' }),
};

const AuthContext = createContext<AuthContextType>(noopAuth);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    return <AuthContext.Provider value={noopAuth}>{children}</AuthContext.Provider>;
  }
  return <AuthProviderInner>{children}</AuthProviderInner>;
}

function AuthProviderInner({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    let cancelled = false;

    async function initAuth() {
      // Check existing session
      const { data: { session: existingSession } } = await supabase.auth.getSession();

      if (existingSession) {
        if (!cancelled) {
          setSession(existingSession);
          setUser(existingSession.user);
          setIsAnonymous(existingSession.user?.is_anonymous ?? false);
          setLoading(false);
        }
      } else {
        // No session → auto sign in anonymously
        const { data, error } = await supabase.auth.signInAnonymously({
          options: { captchaToken: undefined },
        });

        if (!cancelled) {
          if (error) {
            console.warn('[Auth] Anonymous sign-in failed:', error.message);
          } else if (data.session) {
            setSession(data.session);
            setUser(data.session.user);
            setIsAnonymous(true);
          }
          setLoading(false);
        }
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) {
        setSession(session);
        setUser(session?.user ?? null);
        setIsAnonymous(session?.user?.is_anonymous ?? false);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const linkEmail = useCallback(async (email: string) => {
    const { error } = await supabase.auth.updateUser({ email });
    if (error) return { error: error.message };
    return {};
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, session, loading, configured: true, isAnonymous, linkEmail }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
