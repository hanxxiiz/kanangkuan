'use server';

import { createClient } from "@/utils/supabase/server";
import { UserProfile, LeaderboardEntry, Deck, Folder, SearchResult } from "@/types/dashboard";

/**
 * Safely execute a query with timeout and error handling
 */
async function safeQuery<T>(
  queryFn: () => Promise<T>,
  fallback: T,
  errorContext: string,
  timeoutMs: number = 5000
): Promise<T> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout')), timeoutMs);
    });

    const result = await Promise.race([queryFn(), timeoutPromise]);
    return result;
  } catch (error: any) {
    // Only log non-network errors to reduce noise
    const isNetworkError = error.message?.toLowerCase().includes('fetch failed') ||
                          error.message?.toLowerCase().includes('econnreset') ||
                          error.message?.toLowerCase().includes('timeout') ||
                          error.message?.toLowerCase().includes('socket');
    
    if (!isNetworkError) {
      console.error(`Error fetching ${errorContext}:`, error.message || error);
    }
    
    return fallback;
  }
}

export async function GetUserInformation(): Promise<UserProfile | null> {
  return safeQuery(async () => {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) return null;

    const { data, error } = await supabase
      .from("profiles")  
      .select("id, username, xp, profile_url")
      .eq("id", user.id)
      .single();

    if (error || !data) return null;

    return data as UserProfile;
  }, null, 'user information', 3000);
}

export async function GetTopUsers(limit = 3): Promise<LeaderboardEntry[]> {
  return safeQuery(async () => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")  
      .select("username, xp, profile_url")
      .order("xp", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data?.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      xp: user.xp,
      profile_url: user.profile_url,
    })) || [];
  }, [], 'top users', 3000);
}

export async function SearchDecksAndFolders(searchQuery: string): Promise<SearchResult[]> {
  if (searchQuery.trim().length < 2) return [];

  return safeQuery(async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const [deckResult, folderResult] = await Promise.all([
      supabase
        .from("decks")
        .select("id, deck_name, deck_color, folder_id, last_opened")
        .eq("created_by", user.id)
        .ilike("deck_name", `%${searchQuery}%`)
        .order("last_opened", { ascending: false, nullsFirst: false })
        .limit(10),
      supabase
        .from("folders")
        .select("id, folder_name, folder_color")
        .eq("created_by", user.id)
        .ilike("folder_name", `%${searchQuery}%`)
        .limit(10)
    ]);

    const results: SearchResult[] = [];

    folderResult.data?.forEach(folder => {
      results.push({
        type: 'folder',
        id: folder.id,
        name: folder.folder_name,
        color: folder.folder_color,
      });
    });

    deckResult.data?.forEach(deck => {
      results.push({
        type: 'deck',
        id: deck.id,
        name: deck.deck_name,
        color: deck.deck_color,
        folder_id: deck.folder_id,
        last_opened: deck.last_opened,
      });
    });

    return results;
  }, [], 'search results', 4000);
}

export async function GetFolders(): Promise<Folder[]> {
  return safeQuery(async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .eq("created_by", user.id)
      .order("folder_name", { ascending: true });

    if (error) throw error;

    return data || [];
  }, [], 'folders', 3000);
}

export async function GetDecks(folderId?: string | null): Promise<Deck[]> {
  return safeQuery(async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    let query = supabase
      .from("decks")
      .select("*")
      .eq("created_by", user.id);

    if (folderId !== undefined) {
      query = query.eq("folder_id", folderId);
    }

    const { data, error } = await query
      .order("last_opened", { ascending: false, nullsFirst: false });

    if (error) throw error;

    return data || [];
  }, [], 'decks', 3000);
}

export async function GetUnreadNotificationsCount(): Promise<number> {
  return safeQuery(async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return 0;

    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", user.id)
      .eq("read", false);

    if (error) throw error;

    return count || 0;
  }, 0, 'unread notifications count', 3000);
}

export async function GetDeckCardCounts(deckIds: string[]): Promise<Record<string, number>> {
  if (deckIds.length === 0) return {};

  return safeQuery(async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return {};

    const { data, error } = await supabase
      .from("cards")
      .select("deck_id")
      .in("deck_id", deckIds);

    if (error) throw error;

    const cardCounts: Record<string, number> = {};
    data?.forEach(card => {
      cardCounts[card.deck_id] = (cardCounts[card.deck_id] || 0) + 1;
    });

    return cardCounts;
  }, {}, 'deck card counts', 4000);
}

export async function GetMonthlyXPData(year: number, month: number): Promise<Record<string, number>> {
  return safeQuery(async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return {};

    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

    const { data, error } = await supabase
      .from("xp_transactions")
      .select("amount, created_at")
      .eq("user_id", user.id)
      .gte("created_at", startDate)
      .lte("created_at", endDate)
      .order("created_at", { ascending: true });

    if (error) throw error;

    const xpByDate: Record<string, number> = {};
    data?.forEach(transaction => {
      const utcDate = new Date(transaction.created_at);
      const manilaDateString = utcDate.toLocaleString('en-US', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      
      const [m, d, y] = manilaDateString.split('/');
      const dateKey = `${y}-${m}-${d}`;
      
      xpByDate[dateKey] = (xpByDate[dateKey] || 0) + transaction.amount;
    });

    return xpByDate;
  }, {}, 'monthly XP data', 5000);
}

export async function GetDailyLimitsForContext() {
  return safeQuery(async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { hasSpun: false, nextSpinTime: null };

    const { data, error } = await supabase
      .from("user_daily_limits")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return { hasSpun: false, nextSpinTime: null };
    }

    let nextSpinTime = null;
    if (data.has_spun) {
      const now = new Date();
      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0, 0, 0, 0
      );
      nextSpinTime = nextMidnight.toISOString();
    }

    return {
      hasSpun: data.has_spun,
      nextSpinTime,
    };
  }, { hasSpun: false, nextSpinTime: null }, 'daily limits', 3000);
}