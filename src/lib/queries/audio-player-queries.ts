'use server';

import { createClient } from "@/utils/supabase/server";

export type Card = {
  id: string;
  deck_id: string;
  front: string;
  back: string;
};

export type UserSettings = {
  audio_delay: number;
  audio_repetition: number;
  audio_voice: number;
};

export async function GetAudioPlayerUserSettings(): Promise<UserSettings> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { 
      audio_delay: 0, 
      audio_repetition: 1, 
      audio_voice: 0 
    };
  }

  const { data, error } = await supabase
    .from("user_settings")
    .select("audio_delay, audio_repetition, audio_voice")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching user settings:", error);
    return { 
      audio_delay: 0, 
      audio_repetition: 1, 
      audio_voice: 0 
    };
  }

  return data || { 
    audio_delay: 0, 
    audio_repetition: 1, 
    audio_voice: 0 
  };
}

export async function GetCardsForReview(deckId: string): Promise<Card[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("cards")
    .select("id, deck_id, front, back")
    .eq("deck_id", deckId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching cards:", error);
    return [];
  }

  return data || [];
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