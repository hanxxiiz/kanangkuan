"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Lumbaanay } from "@/utils/supabase/models";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { challengeService } from "../services/challenge";
import { Session } from "@/types/challenge";

export interface PresencePayload {
  user_id: string;
  ready: boolean;
  online_at: string;
}

export function useRealtimeWaiting({
    gameId,
    userId,
    game,
    gameType,
}: {
    gameId: string;
    userId?: string;
    game: Session | Lumbaanay | null;
    gameType: string;
}) {
    const router = useRouter();
    const supabase = createClient();
    const routerRef = useRef(router);

    const [presence, setPresence] = useState<Record<string, PresencePayload>>({});
    const [channel, setChannel] = useState<RealtimeChannel | null>(null);

    useEffect(() => {
        if (!userId || !game) return;

        const channel = supabase.channel(`${gameType}-${gameId}`, {
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

            channel.on("broadcast", { event: "game-start" }, () => {
                routerRef.current.push(
                    `/dashboard/games/${gameType}/${game.id}/playing`
                );
            });

            await channel.subscribe();

            const isHost = userId === game.host_id;

            await channel.track({
                user_id: userId,
                ready: isHost,
                online_at: new Date().toISOString(),
            });

            await challengeService.markPlayerReady(gameId, userId!);
        };

        setup();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, game, gameId, supabase]);

    const markReady = useCallback(async () => {
        if (!channel) return;

        await channel.track({
            user_id: userId,
            ready: true,
            online_at: new Date().toISOString(),
        });

        await challengeService.markPlayerReady(gameId, userId!);
    }, [channel, userId]);

    const startGame = useCallback(async () => {
        if (!channel) return;

        await channel.send({
            type: "broadcast",
            event: "game-start",
            payload: { started: true },
        });

        await challengeService.updateGameStatus(gameId, "active");

        router.push(
            `/dashboard/games/${gameType}/${game!.id}/playing`
        );
    }, [channel, router, game?.id]);

    return {
        presence,
        markReady,
        startGame,
    };
}
