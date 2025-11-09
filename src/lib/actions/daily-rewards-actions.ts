'use server';

import { createClient } from "@/utils/supabase/server";
import { DailyLimits, SpinResult, RewardType } from "@/types/dashboard";


export async function GetDailyLimits(): Promise<DailyLimits | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("user_daily_limits")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching daily limits:", error);
    return null;
  }

  return data as DailyLimits;
}

export async function InitializeDailyLimits(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const { error } = await supabase
    .from("user_daily_limits")
    .insert({
      user_id: user.id,
      last_reset: new Date().toISOString(),
      has_spun: false,
      ai_imports_left: 1,
      hints_left: 3,
      lives_left: 5,
      keys_left: 3,
    });

  if (error) {
    console.error("Error initializing daily limits:", error);
    return false;
  }

  return true;
}

export async function CheckAndResetDailyLimits(): Promise<DailyLimits | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  let limits = await GetDailyLimits();

  if (!limits) {
    await InitializeDailyLimits();
    limits = await GetDailyLimits();
    return limits;
  }

  const now = new Date();
  const lastReset = new Date(limits.last_reset);
  
  const isNewDay = now.getDate() !== lastReset.getDate() || 
                   now.getMonth() !== lastReset.getMonth() || 
                   now.getFullYear() !== lastReset.getFullYear();

  if (isNewDay) {
    const { data, error } = await supabase
      .from("user_daily_limits")
      .update({
        last_reset: now.toISOString(),
        has_spun: false,
        ai_imports_left: 5,
        hints_left: 10,
        lives_left: 3,
        keys_left: 2,
      })
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error resetting daily limits:", error);
      return limits;
    }

    return data as DailyLimits;
  }

  return limits;
}

export async function ProcessSpinReward(
  rewardType: RewardType,
  amount: number
): Promise<SpinResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  const limits = await CheckAndResetDailyLimits();

  if (!limits) {
    return { success: false, error: "Could not fetch daily limits" };
  }

  if (limits.has_spun) {
    const nextMidnight = getNextMidnight();
    return {
      success: false,
      error: "Already spun today",
      nextSpinTime: nextMidnight.toISOString(),
    };
  }

  if (rewardType === 'xp') {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("xp")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return { success: false, error: "Failed to fetch profile" };
    }

    const newXP = (profileData?.xp || 0) + amount;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ xp: newXP })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating XP:", updateError);
      return { success: false, error: "Failed to update XP" };
    }

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();

    const { data: existingTransaction } = await supabase
      .from("xp_transactions")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", startOfDay)
      .lte("created_at", endOfDay)
      .single();

    if (existingTransaction) {
      const { error: transactionError } = await supabase
        .from("xp_transactions")
        .update({ amount: existingTransaction.amount + amount })
        .eq("id", existingTransaction.id);

      if (transactionError) {
        console.error("Error updating xp_transaction:", transactionError);
      }
    } else {
      const { error: transactionError } = await supabase
        .from("xp_transactions")
        .insert({
          user_id: user.id,
          amount: amount,
          created_at: new Date().toISOString(),
        });

      if (transactionError) {
        console.error("Error creating xp_transaction:", transactionError);
      }
    }

    const { error: spinError } = await supabase
      .from("user_daily_limits")
      .update({ has_spun: true })
      .eq("user_id", user.id);

    if (spinError) {
      console.error("Error marking spin:", spinError);
      return { success: false, error: "Failed to mark spin" };
    }

    const nextMidnight = getNextMidnight();
    return {
      success: true,
      reward: {
        type: rewardType,
        amount,
      },
      nextSpinTime: nextMidnight.toISOString(),
    };
  }

  const columnMap: Record<RewardType, string> = {
    ai_imports: 'ai_imports_left',
    hints: 'hints_left',
    lives: 'lives_left',
    keys: 'keys_left',
    xp: '', // Not used here
  };

  const column = columnMap[rewardType];
  const currentValue = limits[column as keyof DailyLimits] as number;
  const newValue = currentValue + amount;

  const { error } = await supabase
    .from("user_daily_limits")
    .update({
      [column]: newValue,
      has_spun: true,
    })
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating reward:", error);
    return { success: false, error: "Failed to process reward" };
  }

  const nextMidnight = getNextMidnight();

  return {
    success: true,
    reward: {
      type: rewardType,
      amount,
    },
    nextSpinTime: nextMidnight.toISOString(),
  };
}

function getNextMidnight(): Date {
  const now = new Date();
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0, 0, 0, 0
  );
  return nextMidnight;
}

export async function GetTimeUntilNextSpin(): Promise<string | null> {
  const limits = await CheckAndResetDailyLimits();
  
  if (!limits || !limits.has_spun) {
    return null; 
  }

  return getNextMidnight().toISOString();
}