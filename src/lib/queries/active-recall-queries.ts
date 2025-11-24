"use server";

import { createClient } from "@/utils/supabase/server";

export interface ActiveRecallCard {
  id: string;
  deck_id: string;
  front: string;  // Changed from card_front
  back: string;   // Changed from card_back
  blank_word: string | null;
  created_at: string;
}

export interface UserDailyLimits {
  hints_left: number;
  lives_left: number;
}

export async function GetCardsForActiveRecall(
  deckId: string
): Promise<ActiveRecallCard[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("cards")
      .select("id, deck_id, front, back, blank_word, created_at")
      .eq("deck_id", deckId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching cards:", error);
      return [];
    }

    return (data || []).map(card => ({
      id: card.id,
      deck_id: card.deck_id,
      front: card.front,
      back: card.back,     
      blank_word: card.blank_word,
      created_at: card.created_at,
    }));
  } catch (error) {
    console.error("Error in GetCardsForActiveRecall:", error);
    return [];
  }
}

export async function GetUserDailyLimits(): Promise<UserDailyLimits | null> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Error getting user:", userError);
      return null;
    }

    const { data, error } = await supabase
      .from("user_daily_limits")
      .select("hints_left, lives_left")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching user daily limits:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in GetUserDailyLimits:", error);
    return null;
  }
}

// Optional: Function to update daily limits when user uses hints/lives
export async function UpdateUserDailyLimits(
  hintsLeft?: number,
  livesLeft?: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    const updates: Record<string, number> = {};
    if (hintsLeft !== undefined) updates.hints_left = hintsLeft;
    if (livesLeft !== undefined) updates.lives_left = livesLeft;

    const { error } = await supabase
      .from("user_daily_limits")
      .update(updates)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating user daily limits:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in UpdateUserDailyLimits:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Optional: Decrement a specific limit (for convenience)
export async function DecrementHints(): Promise<{ success: boolean; newValue?: number; error?: string }> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    // Get current value
    const { data: currentData, error: fetchError } = await supabase
      .from("user_daily_limits")
      .select("hints_left")
      .eq("user_id", user.id)
      .single();

    if (fetchError || !currentData) {
      return { success: false, error: "Could not fetch current hints" };
    }

    const newValue = Math.max(0, currentData.hints_left - 1);

    // Update
    const { error: updateError } = await supabase
      .from("user_daily_limits")
      .update({ hints_left: newValue })
      .eq("user_id", user.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true, newValue };
  } catch (error) {
    console.error("Error in DecrementHints:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function DecrementLives(): Promise<{ success: boolean; newValue?: number; error?: string }> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    // Get current value
    const { data: currentData, error: fetchError } = await supabase
      .from("user_daily_limits")
      .select("lives_left")
      .eq("user_id", user.id)
      .single();

    if (fetchError || !currentData) {
      return { success: false, error: "Could not fetch current lives" };
    }

    const newValue = Math.max(0, currentData.lives_left - 1);

    // Update
    const { error: updateError } = await supabase
      .from("user_daily_limits")
      .update({ lives_left: newValue })
      .eq("user_id", user.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true, newValue };
  } catch (error) {
    console.error("Error in DecrementLives:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}