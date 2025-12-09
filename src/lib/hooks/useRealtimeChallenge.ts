"use client";

import { createClient } from "@/utils/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";

export interface PresencePayload {
  user_id: string;
  status: "answering" | "done" | "correct" | "wrong" | "submitting_fake";
  updated_at: string;
}

export interface TimerState {
  timer_start_at: string | null;
  timer_end_at: string | null;
  is_timer_running: boolean;
  bet_baittimer_start_at: string | null;
  bet_bait_timer_end_at: string | null;
  is_bet_bait_timer_running: boolean;
  question_index?: number;
}

export interface SessionState {
  current_question_index: number;
}

export function useRealtimeChallenge({
    challengeId,
    userId,
  }: {
    challengeId: string;
    userId: string;
  }) {
    const supabase = createClient();

    const [presence, setPresence] = useState<Record<string, PresencePayload>>({});
    const [channel, setChannel] = useState<RealtimeChannel | null>(null);
    const [timerState, setTimerState] = useState<TimerState | null>(null);
    const [sessionState, setSessionState] = useState<SessionState | null>(null);

    useEffect(() => {
      if (!userId || !challengeId)  return;

      const channel = supabase.channel(`challenge-${challengeId}`, {
        config: { presence: { key: userId } },
      });

      setChannel(channel);

      const setup = async () => {
        channel.on("presence", { event: "sync" }, () => {
          const state = channel.presenceState() as Record<
            string,
            PresencePayload[]
          >;

          const players: Record<string, PresencePayload> = {};

          for (const key in state) {
            const entry = state[key][0];
            if (entry?.user_id) players[entry.user_id] = entry;
          }

          setPresence(players);
        });

        channel.on(
          "postgres_changes",
          {
            event: "*",
            schema: "challenge",
            table: "questions",
            filter: `session_id=eq.${challengeId}`,
          },
          (payload) => {
            const newData = payload.new as any;
            setTimerState({
              timer_start_at: newData.timer_start_at,
              timer_end_at: newData.timer_end_at,
              is_timer_running: newData.is_timer_running,
              bet_baittimer_start_at: newData.bet_bait_timer_start_at,
              bet_bait_timer_end_at: newData.bet_bait_timer_end_at,
              is_bet_bait_timer_running: newData.is_bet_bait_timer_running,
              question_index: newData.question_index
            });
          }
        );

        channel.on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "challenge",
            table: "sessions",
            filter: `id=eq.${challengeId}`,
          },
          (payload) => {
            console.log("📨 Session updated:", payload);
            const newData = payload.new as any;
            setSessionState({
              current_question_index: newData.current_question_index,
            });
          }
        );

        await channel.subscribe();

        await channel.track({
          user_id: userId,
          status: "answering",
          updated_at: new Date().toISOString(),
        });
      };

      setup();

      return () => {
        supabase.removeChannel(channel);
      };
    }, [challengeId, userId, supabase]);

    const updatePlayerStatus = useCallback(
      async (status: PresencePayload["status"]) => {
        if (!channel || !userId) return;

        await channel.track({
          user_id: userId,
          status: status,
          updated_at: new Date().toISOString(),
        });
      },
      [channel, userId]
    );

    return {
      presence,
      timerState,
      sessionState,
      updatePlayerStatus,
    };
}


          


        