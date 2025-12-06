"use client";

import { GameState } from '@/types/challenge-gameplay';
import { createClient } from '@/utils/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useCallback, useEffect, useRef, useState } from 'react'
import { useChallengeGamePlay } from './useChallengeGamePlay';
import { useProfiles } from './useProfile';
import { PresencePayload } from '@/types/realtime';

export function useRealtimeChallenge({
    challengeId,
    userId
}: {
    challengeId: string;
    userId: string;
}) {
  const supabase = createClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [presence, setPresence] = useState<Record<string, PresencePayload>>({});

  // Get player IDs from gameState if available, otherwise from presence
  const playerIds = gameState 
    ? Object.keys(gameState.players) 
    : Object.keys(presence);
  const { profiles } = useProfiles({ userIds: playerIds });

  useEffect(() => {
    const channel = supabase.channel(`challenge-${challengeId}`, {
      config: { presence: { key: userId } },
    });
    
    channelRef.current = channel;
    
    const setup = async () => {
      // Listen for presence updates to get initial player list
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

      // Listen for game state updates
      channel.on("broadcast", {event: "game-state"}, ({payload}) => {
        setGameState(payload.state);
      });

      await channel.subscribe();

      // Track presence
      await channel.track({
        user_id: userId,
        ready: false,
        online_at: new Date().toISOString(),
      });
    };

    setup();

    return () => {
        supabase.removeChannel(channel);
    };
  }, [challengeId, userId, supabase]);

  const submitAnswer = useCallback(
    async (answer: string) => {
        const channel = channelRef.current;
        if (!channel) return;

        await channel.send({
            type: "broadcast",
            event: "player-answer",
            payload: {
                userId,
                answer,
            },
        });
    },
    [userId]
  );

  const nextQuestion = useCallback(async () => {
    const channel = channelRef.current;
    if (!channel) return;

    await channel.send({
        type: "broadcast",
        event: "next-question",
        payload: {},
    });
  }, []);

  const gameplay = useChallengeGamePlay(gameState!);

  return {
    ...gameplay,
    profiles,
    submitAnswer,
    nextQuestion,
  };
}
