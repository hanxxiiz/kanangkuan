"use client";

import { createClient } from "@/utils/supabase/client";
import React, { useEffect, useState } from "react";
import { useUser } from "@/lib/hooks/useUser";
import { useProfiles } from "@/lib/hooks/useProfile";
import { Button } from "@/components/buttons/PrimaryButton";
import { useRouter } from "next/navigation";
import { useChallenges } from "@/lib/hooks/useChallenges";

export default function WaitingPlayers({ challengeId }: { challengeId: string }) {
    const { user } = useUser();
    const router = useRouter();
    const supabase = createClient();

    const { challenge, challengeLoading } = useChallenges(challengeId);

    const [presence, setPresence] = useState<any>({});
    const { profiles } = useProfiles({ userIds: Object.keys(presence) });

    // ───────────────────────────────────────────────
    // PRESENCE + BROADCAST REALTIME SETUP
    // ───────────────────────────────────────────────
    useEffect(() => {
        if (!user?.id || !challenge) return;

        const channel = supabase.channel(`challenge-${challengeId}`, {
            config: {
                presence: { key: user.id }
            }
        });

        const setupRealtime = async () => {
            channel
                // PRESENCE SYNC
                .on("presence", { event: "sync" }, () => {
                    const state = channel.presenceState() as Record<string, any>;
                    const players: any = {};
                    for (const key in state) {
                        const entry = state[key][0];
                        if (entry?.user_id) players[entry.user_id] = entry;
                    }
                    setPresence(players);
                })
                // BROADCAST HANDLER: HOST STARTED GAME
                .on("broadcast", { event: "game-start" }, () => {
                    router.push(`/dashboard/games/challenge/${challenge.id}/playing`);
                })
                .subscribe();

            // TRACK PLAYER PRESENCE
            await channel.track({
                user_id: user.id,
                ready: user.id === challenge.host_id, // host always ready
                online_at: new Date().toISOString(),
            });
        };

        setupRealtime();

        // CLEANUP — **synchronous only**
        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id, challenge]);

    if (challengeLoading || !challenge) {
        return <p className="text-white">Loading...</p>;
    }

    const isHost = user?.id === challenge.host_id;

    // ───────────────────────────────────────────────
    // READINESS LOGIC (1+ non-host required)
    // ───────────────────────────────────────────────
    const readyPlayers = Object.values(presence).filter((p: any) => p.ready);
    const readyNonHost = readyPlayers.filter(
        (p: any) => p.user_id !== challenge.host_id
    ).length;

    const canStart = readyNonHost >= 1; // ← updated rule

    // ───────────────────────────────────────────────
    // ACTIONS
    // ───────────────────────────────────────────────

    const markReady = async () => {
        const channel = supabase.channel(`challenge-${challengeId}`);

        await channel.track({
            user_id: user!.id,
            ready: true,
            online_at: new Date().toISOString(),
        });
    };

    // HOST ONLY — broadcast event
    const startGame = async () => {
        const channel = supabase.channel(`challenge-${challengeId}`);

        channel.send({
            type: "broadcast",
            event: "game-start",
            payload: { started: true }
        });

        // Host also navigates
        router.push(`/dashboard/games/challenge/${challenge.id}/playing`);
    };

    // ───────────────────────────────────────────────
    // JSX
    // ───────────────────────────────────────────────
    return (
        <div className="flex flex-col justify-center items-center gap-5">
            <div className="flex flex-row items-center justify-center gap-10">
                {profiles.map((profile) => {
                    const p = presence[profile.id];
                    const isReady = p?.ready;

                    return (
                        <div
                            key={profile.id}
                            className="flex flex-row justify-start items-center gap-3 bg-white p-3 w-75 border-3 border-black rounded-full"
                        >
                            <img src={profile.profile_url} className="w-15 h-15 rounded-full" />

                            <div className="flex flex-col justify-start items-start">
                                <h2
                                    className={`font-main text-xl ${
                                        isReady ? "text-pink" : "text-lime"
                                    }`}
                                >
                                    {isReady ? "Ready" : "Joined"}
                                </h2>
                                <h3 className="font-body text-sm text-gray-600">@{profile.username}</h3>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* HOST BUTTON */}
            {isHost ? (
                <Button
                    variant="flat"
                    size="lg"
                    className="w-100 py-4 text-xl"
                    disabled={!canStart}
                    onClick={startGame}
                >
                    Start Game
                </Button>
            ) : (
                // OTHER PLAYERS BUTTON
                <Button
                    variant="flat"
                    size="lg"
                    className="w-100 py-4 text-xl"
                    onClick={markReady}
                >
                    Ready
                </Button>
            )}
        </div>
    );
}
