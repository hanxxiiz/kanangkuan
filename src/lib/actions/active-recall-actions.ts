"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

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

    revalidatePath('/dashboard/practice');

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

    revalidatePath('/dashboard/practice');

    return { success: true, newValue };
  } catch (error) {
    console.error("Error in DecrementLives:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Add or update XP for the current day
export async function AddXPTransaction(
  xpAmount: number
): Promise<{ success: boolean; totalXP?: number; error?: string }> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    // Get start and end of today in UTC
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    // Check if there's an existing XP transaction for today
    const { data: existingTransaction, error: fetchError } = await supabase
      .from("xp_transactions")
      .select("id, amount")
      .eq("user_id", user.id)
      .gte("created_at", startOfDay.toISOString())
      .lt("created_at", endOfDay.toISOString())
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 is "no rows returned" - that's fine
      console.error("Error fetching existing XP transaction:", fetchError);
      return { success: false, error: fetchError.message };
    }

    let totalXP: number;

    if (existingTransaction) {
      // Update existing transaction
      totalXP = existingTransaction.amount + xpAmount;
      
      const { error: updateError } = await supabase
        .from("xp_transactions")
        .update({ amount: totalXP })
        .eq("id", existingTransaction.id);

      if (updateError) {
        console.error("Error updating XP transaction:", updateError);
        return { success: false, error: updateError.message };
      }
    } else {
      // Create new transaction for today
      totalXP = xpAmount;
      
      const { error: insertError } = await supabase
        .from("xp_transactions")
        .insert({
          user_id: user.id,
          amount: totalXP,
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("Error creating XP transaction:", insertError);
        return { success: false, error: insertError.message };
      }
    }

    // Update the user's total XP in profiles table
    const { data: profileData, error: profileFetchError } = await supabase
      .from("profiles")
      .select("xp")
      .eq("id", user.id)
      .single();

    if (profileFetchError) {
      console.error("Error fetching profile XP:", profileFetchError);
      return { success: false, error: profileFetchError.message };
    }

    const newTotalXP = (profileData?.xp || 0) + xpAmount;

    const { error: profileUpdateError } = await supabase
      .from("profiles")
      .update({ xp: newTotalXP })
      .eq("id", user.id);

    if (profileUpdateError) {
      console.error("Error updating profile XP:", profileUpdateError);
      return { success: false, error: profileUpdateError.message };
    }

    revalidatePath('/dashboard');

    return { success: true, totalXP };
  } catch (error) {
    console.error("Error in AddXPTransaction:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
