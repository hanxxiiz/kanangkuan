import { useSupabase } from "@/components/providers/SupabaseProvider";

export function useUser() {
  const { session, isLoaded } = useSupabase();
  return { user: session?.user ?? null, isLoaded };
}
