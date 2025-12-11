"use client";

import React from "react";
import { useUser } from "@/lib/hooks/useUser";
import { useProfiles } from "@/lib/hooks/useProfile";
import { Button } from "@/components/buttons/PrimaryButton";
import { useChallenges } from "@/lib/hooks/useChallenges";
import { useRealtimeWaiting } from "@/lib/hooks/useRealtimeWaiting";
import Image from "next/image";

export interface PresencePayload {
  user_id: string;
  ready: boolean;
  online_at: string;
}

export default function WaitingChallengePlayers({ challengeId }: { challengeId: string }) {
    const { user } = useUser();
    const { challenge, challengeLoading } = useChallenges(challengeId);

    const { presence, markReady, startGame } = useRealtimeWaiting({
        gameId: challengeId,
        userId: user?.id,
        game: challenge,
        gameType: "challenge"
    });

    const { profiles } = useProfiles({ userIds: Object.keys(presence) });

    if (challengeLoading || !challenge) return <p className="text-white">Loading...</p>;

    const isHost = user?.id === challenge.host_id;

    const readyPlayers: PresencePayload[] = Object.values(presence).filter(
        (p) => p.ready
    );

    const readyNonHost = readyPlayers.filter(
        (p) => p.user_id !== challenge!.host_id
    ).length;

    const canStart = readyNonHost >= 1;

    return (
        <div className="flex flex-col justify-center items-center gap-4 sm:gap-5 px-3 sm:px-5">

    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 lg:gap-10 w-full max-w-4xl">
        {profiles.map((profile) => {
            const p = presence[profile.id];
            const isReady = p?.ready;

            return (
                <div
                    key={profile.id}
                    className="flex flex-row gap-2 sm:gap-3 bg-white p-2 sm:p-3 w-full sm:w-auto sm:min-w-[240px] lg:min-w-[280px] border-2 sm:border-3 border-black rounded-full"
                >
                    <Image 
                        src={profile.profile_url || "/dashboard/default-picture.png"} 
                        className="w-12 h-12 sm:w-14 sm:h-14 lg:w-15 lg:h-15 rounded-full flex-shrink-0" 
                        alt={profile.username}
                        width={100}
                        height={100}
                        sizes="100vw"
                    />
                    <div className="flex flex-col justify-center min-w-0 flex-1">
                        <h2 className={`font-main text-base sm:text-lg lg:text-xl truncate ${isReady ? "text-pink" : "text-lime"}`}>
                            {isReady ? "Ready" : "Joined"}
                        </h2>
                        <h3 className="font-body text-xs sm:text-sm text-gray-600 truncate">@{profile.username}</h3>
                    </div>
                </div>
            );
        })}
    </div>

    {isHost ? (
        <Button
            variant="flat"
            size="lg"
            className="w-full sm:w-80 lg:w-100 py-3 sm:py-4 text-lg sm:text-xl"
            disabled={!canStart}
            onClick={startGame}
        >
            {canStart ? "Start Game" : "Not Ready"}
        </Button>
    ) : (
        <Button
            variant="flat"
            size="lg"
            className="w-full sm:w-80 lg:w-100 py-3 sm:py-4 text-lg sm:text-xl"
            onClick={markReady}
        >
            Ready
        </Button>
    )}
</div>
    );
}
