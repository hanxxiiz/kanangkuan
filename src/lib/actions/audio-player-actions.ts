"use server";

import { createClient } from "@/utils/supabase/server";

export interface UpdateAudioSettingsParams {
  audio_delay: number;
  audio_repetition: number;
  audio_voice: number;
}

export async function UpdateAudioSettings(
  settings: UpdateAudioSettingsParams
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Update the user settings
    const { error: updateError } = await supabase
      .from("user_settings")
      .update({
        audio_delay: settings.audio_delay,
        audio_repetition: settings.audio_repetition,
        audio_voice: settings.audio_voice,
      })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error updating audio settings:", updateError);
      return {
        success: false,
        error: updateError.message,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error updating audio settings:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}