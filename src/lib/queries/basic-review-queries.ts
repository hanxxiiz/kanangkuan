'use server';

import { createClient } from "@/utils/supabase/server";

export type Card = {
  id: string;
  deck_id: string;
  front: string;
  back: string;
};

export type UserSettings = {
  review_sort_order: 'oldest_first' | 'newest_first' | 'random_order';
};

export async function GetUserSettings(): Promise<UserSettings> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { review_sort_order: 'oldest_first' };
  }

  const { data, error } = await supabase
    .from("user_settings")
    .select("review_sort_order")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching user settings:", error);
    return { review_sort_order: 'oldest_first' };
  }

  return data || { review_sort_order: 'oldest_first' };
}

export async function GetCardsForReview(deckId: string, sortOrder?: 'oldest_first' | 'newest_first' | 'random_order'): Promise<Card[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  if (!sortOrder) {
    const settings = await GetUserSettings();
    sortOrder = settings.review_sort_order;
  }

  let query = supabase
    .from("cards")
    .select("id, deck_id, front, back")
    .eq("deck_id", deckId);

  if (sortOrder === 'oldest_first') {
    query = query.order("created_at", { ascending: true });
  } else if (sortOrder === 'newest_first') {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching cards:", error);
    return [];
  }

  let cards = data || [];

  if (sortOrder === 'random_order' && cards.length > 0) {
    cards = shuffleArray(cards);
  }

  return cards;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function GetDeckInfo(deckId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("decks")
    .select("deck_name, deck_color")
    .eq("id", deckId)
    .eq("created_by", user.id)
    .single();

  if (error) {
    console.error("Error fetching deck info:", error);
    return null;
  }

  return data;
}

export async function GetUserKeys(): Promise<number> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return 0;

  const { data, error } = await supabase
    .from("user_daily_limits")
    .select("keys_left")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching user keys:", error);
    return 0;
  }

  return data?.keys_left || 0;
}

export async function GetUserProfilePic(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")  
    .select("profile_url")
    .eq("id", user.id)
    .single();

  if (error || !data) return null;

  return data.profile_url || null;
}