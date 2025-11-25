"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export function useRealtime({
    challengeId,
    user,
    challenge,
}: {
    challengeId: string;
    user: any;
    challenge: any;
}) {
    const router = useRouter();
    const supabase = createClient();
    const routerRef = useRef(router);

    const [presence, setPresence] = useState<any>({});
    const [channel, setChannel] = useState<any>(null);

    useEffect(() => {
        if (!user?.id || !challenge) return;

        const channel = supabase.channel(`challenge-${challengeId}`, {
            config: { presence: { key: user.id } },
        });
        setChannel(channel);

        const setup = async () => {
            channel.on("presence", { event: "sync" }, () => {
                const state = channel.presenceState() as Record<string, any>;
                const players: any = {};
                for (const key in state) {
                    const entry = state[key][0];
                    if (entry?.user_id) players[entry.user_id] = entry;
                }
                setPresence(players);
            });

            channel.on("broadcast", { event: "game-start" }, () => {
                routerRef.current.push(`/dashboard/games/challenge/${challenge.id}/playing`);
            });

            await channel.subscribe();

            const isHost = user.id === challenge.host_id;
            await channel.track({
                user_id: user.id,
                ready: isHost,
                online_at: new Date().toISOString(),
            });
        };

        setup();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id, challenge, challengeId, supabase]);

    const markReady = useCallback(async () => {
        if (!channel) return;
        await channel.track({
            user_id: user?.id!,
            ready: true,
            online_at: new Date().toISOString(),
        });
    }, [channel, user?.id]);

    const startGame = useCallback(async () => {
        if (!channel) return;

        await channel.send({
            type: "broadcast",
            event: "game-start",
            payload: { started: true },
        });

        router.push(`/dashboard/games/challenge/${challenge.id}/playing`);
    }, [channel, router, challenge?.id]);

    return {
        presence,
        markReady,
        startGame,
    };
}
