"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { User, AuthChangeEvent, Session } from "@supabase/supabase-js";

interface AuthContextValue {
  user: User | null;
  householdId: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  householdId: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchHouseholdId = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("household_id")
        .eq("id", userId)
        .single();
      setHouseholdId(data?.household_id ?? null);
    },
    [supabase]
  );

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchHouseholdId(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchHouseholdId(session.user.id).finally(() => setLoading(false));
      } else {
        setHouseholdId(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchHouseholdId]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setHouseholdId(null);
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, householdId, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
