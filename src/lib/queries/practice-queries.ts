"use server";

import { createClient } from "@/utils/supabase/server";

export interface DeckInfo {
  deck_name: string;
  deck_color: string;
}

export async function GetDeckInfo(deckId: string): Promise<DeckInfo | null> {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase
      .from("decks")
      .select("deck_name, deck_color")
      .eq("id", deckId)
      .single();

    if (error) {
      console.error("Error fetching deck info:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in GetDeckInfo:", error);
    return null;
  }
}