"use client";

import React from "react";
import { useUser } from "@/lib/hooks/useUser";
import { useProfiles } from "@/lib/hooks/useProfile";
import { Button } from "@/components/buttons/PrimaryButton";
import { useLumbaanays } from "@/lib/hooks/useLumbaanays";
import { useRealtime } from "@/lib/hooks/useRealtime";
import { PresencePayload } from "@/types/realtime";

export default function WaitingLumbaanayPlayers({ lumbaanayId }: { lumbaanayId: string }) {
    const { user } = useUser();
    const { lumbaanay, lumbaanayLoading } = useLumbaanays(lumbaanayId);

    const { presence, markReady, startGame } = useRealtime({
        gameId: lumbaanayId,
        userId: user?.id,
        game: lumbaanay,
        gameType: "lumbaanay"
    });

    const { profiles } = useProfiles({ userIds: Object.keys(presence) });

    if (lumbaanayLoading || !lumbaanay) return <p className="text-white">Loading...</p>;

    const isHost = user?.id === lumbaanay.host_id;

    const readyPlayers: PresencePayload[] = Object.values(presence).filter(
        (p) => p.ready
    );

    const readyNonHost = readyPlayers.filter(
        (p) => p.user_id !== lumbaanay!.host_id
    ).length;

    const canStart = readyNonHost >= 1;

    return (
        <div className="flex flex-col justify-center items-center gap-5">

            <div className="flex flex-row items-center justify-center gap-10">
                {profiles.map((profile) => {
                    const p = presence[profile.id];
                    const isReady = p?.ready;

                    return (
                        <div
                            key={profile.id}
                            className="flex flex-row gap-3 bg-white p-3 w-75 border-3 border-black rounded-full"
                        >
                            <img src={profile.profile_url} className="w-15 h-15 rounded-full" />
                            <div className="flex flex-col">
                                <h2 className={`font-main text-xl ${isReady ? "text-pink" : "text-lime"}`}>
                                    {isReady ? "Ready" : "Joined"}
                                </h2>
                                <h3 className="font-body text-sm text-gray-600">@{profile.username}</h3>
                            </div>
                        </div>
                    );
                })}
            </div>

            {isHost ? (
                <Button
                    variant="flat"
                    size="lg"
                    className="w-100 py-4 text-xl"
                    disabled={!canStart}
                    onClick={startGame}
                >
                    {canStart ? "Start Game" : "Not Ready"}
                </Button>
            ) : (
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
