'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function DecrementUserKeys(): Promise<{ success: boolean; keysLeft: number }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, keysLeft: 0 };
  }

  const { data: currentData, error: fetchError } = await supabase
    .from("user_daily_limits")
    .select("keys_left")
    .eq("user_id", user.id)
    .single();

  if (fetchError || !currentData) {
    console.error("Error fetching current keys:", fetchError);
    return { success: false, keysLeft: 0 };
  }

  if (currentData.keys_left <= 0) {
    return { success: false, keysLeft: 0 };
  }

  const { data, error } = await supabase
    .from("user_daily_limits")
    .update({ keys_left: currentData.keys_left - 1 })
    .eq("user_id", user.id)
    .select("keys_left")
    .single();

  if (error) {
    console.error("Error decrementing keys:", error);
    return { success: false, keysLeft: currentData.keys_left };
  }

  return { success: true, keysLeft: data.keys_left };
}

export async function UpdateUserSettings(sortOrder: 'oldest_first' | 'newest_first' | 'random_order') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("user_settings")
    .update({ 
      review_sort_order: sortOrder,
      updated_at: new Date().toISOString()
    })
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating user settings:", error);
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/practice');
  return { success: true };
}