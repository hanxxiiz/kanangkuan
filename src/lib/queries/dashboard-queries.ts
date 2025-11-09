'use server';

import { createClient } from "@/utils/supabase/server";
import { UserProfile, LeaderboardEntry, Deck, Folder, SearchResult } from "@/types/dashboard";

export async function GetUserInformation(): Promise<UserProfile | null> {
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
}

export async function GetTopUsers(limit = 3): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")  
    .select("username, xp, profile_url")
    .order("xp", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching top users:", error);
    return [];
  }

  return data?.map((user, index) => ({
    rank: index + 1,
    username: user.username,
    xp: user.xp,
    profile_url: user.profile_url,
  })) || [];
}

export async function SearchDecksAndFolders(searchQuery: string): Promise<SearchResult[]> {
  if (searchQuery.trim().length < 2) return [];

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: decks, error: deckError } = await supabase
    .from("decks")
    .select("id, deck_name, deck_color, folder_id, last_opened")
    .eq("created_by", user.id)
    .ilike("deck_name", `%${searchQuery}%`)
    .order("last_opened", { ascending: false, nullsFirst: false })
    .limit(10);

  const { data: folders, error: folderError } = await supabase
    .from("folders")
    .select("id, folder_name, folder_color")
    .eq("created_by", user.id)
    .ilike("folder_name", `%${searchQuery}%`)
    .limit(10);

  if (deckError) console.error("Error searching decks:", deckError);
  if (folderError) console.error("Error searching folders:", folderError);

  const results: SearchResult[] = [];

  folders?.forEach(folder => {
    results.push({
      type: 'folder',
      id: folder.id,
      name: folder.folder_name,
      color: folder.folder_color,
    });
  });

  decks?.forEach(deck => {
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
}

export async function GetFolders(): Promise<Folder[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .eq("created_by", user.id)
    .order("folder_name", { ascending: true });

  if (error) {
    console.error("Error fetching folders:", error);
    return [];
  }

  return data || [];
}


export async function GetDecks(folderId?: string | null): Promise<Deck[]> {
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

  if (error) {
    console.error("Error fetching decks:", error);
    return [];
  }

  return data || [];
}

export async function GetUnreadNotificationsCount(): Promise<number> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return 0;

  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: 'exact', head: true })
    .eq("user_id", user.id)
    .eq("read", false);

  if (error) {
    console.error("Error fetching unread notifications count:", error);
    return 0;
  }

  return count || 0;
}

export async function GetDeckCardCounts(deckIds: string[]): Promise<Record<string, number>> {
  if (deckIds.length === 0) return {};

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return {};

  const { data, error } = await supabase
    .from("cards")
    .select("deck_id")
    .in("deck_id", deckIds);

  if (error) {
    console.error("Error fetching card counts:", error);
    return {};
  }

  const cardCounts: Record<string, number> = {};
  data?.forEach(card => {
    cardCounts[card.deck_id] = (cardCounts[card.deck_id] || 0) + 1;
  });

  return cardCounts;
}

export async function GetMonthlyXPData(year: number, month: number): Promise<Record<string, number>> {
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

  if (error) {
    console.error("Error fetching monthly XP data:", error);
    return {};
  }

  const xpByDate: Record<string, number> = {};
  data?.forEach(transaction => {
    const date = new Date(transaction.created_at);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    xpByDate[dateKey] = (xpByDate[dateKey] || 0) + transaction.amount;
  });

  return xpByDate;
}

export async function GetDailyLimitsForContext() {
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

  // Calculate next spin time if already spun
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
}