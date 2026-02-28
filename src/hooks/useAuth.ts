"use client";

import { useEffect, useState } from "react";
import { supabase, supabaseConfigured } from "@/lib/supabase-client";

const DEMO_KEY = "vc_demo_session";

export type AuthUser = {
  id: string;
  email: string;
  isDemo: boolean;
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (supabaseConfigured && supabase) {
      void supabase.auth.getSession().then(({ data }) => {
        const u = data.session?.user;
        if (u) setUser({ id: u.id, email: u.email ?? "", isDemo: false });
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
        const u = session?.user;
        setUser(u ? { id: u.id, email: u.email ?? "", isDemo: false } : null);
      });

      return () => subscription.unsubscribe();
    } else {
      const stored = localStorage.getItem(DEMO_KEY);
      if (stored) setUser(JSON.parse(stored) as AuthUser);
      setLoading(false);
    }
  }, []);

  async function signIn(email: string, password: string): Promise<string | null> {
    if (!supabaseConfigured || !supabase) {
      return "Supabase yapılandırılmamış. Demo olarak devam edebilirsiniz.";
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  }

  async function signUp(email: string, password: string): Promise<string | null> {
    if (!supabaseConfigured || !supabase) {
      return "Supabase yapılandırılmamış. Demo olarak devam edebilirsiniz.";
    }
    const { error } = await supabase.auth.signUp({ email, password });
    return error?.message ?? null;
  }

  function continueAsDemo() {
    const demo: AuthUser = { id: "demo", email: "demo@virtual.dev", isDemo: true };
    localStorage.setItem(DEMO_KEY, JSON.stringify(demo));
    setUser(demo);
  }

  async function signOut() {
    if (supabaseConfigured && supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem(DEMO_KEY);
    }
    setUser(null);
  }

  return { user, loading, signIn, signUp, signOut, continueAsDemo };
}
