"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { SupabaseClient, Session } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

type SupabaseContextType = {
  supabase: SupabaseClient | null;
  session: Session | null;
  isLoaded: boolean;
};

const SupabaseContext = createContext<SupabaseContextType>({
  supabase: null,
  session: null,
  isLoaded: false,
});

export default function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [session, setSession] = useState<Session | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoaded(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <SupabaseContext.Provider value={{ supabase, session, isLoaded }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error("useSupabase must be used inside SupabaseProvider");
  }
  return context;
};
