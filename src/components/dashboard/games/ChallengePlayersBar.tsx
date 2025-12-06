"use client";

import React from 'react'
import PlayerStatus from './PlayerStatus';
import { PlayerStatus as PlayerStatusType } from '@/types/challenge-gameplay';

export default function ChallengePlayersBar({
    profiles,
    playerStates,
    statusOverrides,
} : {
    profiles: { id: string; username: string; profile_url?: string }[];
    playerStates: Record<string, { status: PlayerStatusType }>;
    statusOverrides?: Record<string, PlayerStatusType>;
}) {
    if (profiles.length === 0) {
        return (
            <div className="flex flex-row justify-start gap-4 p-4 bg-gray-100 rounded-lg overflow-x-auto">
                <p className="text-gray-500">Loading players...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-row justify-start gap-4 p-4 rounded-lg overflow-x-auto">
        {profiles.map((profile) => {
            const state = playerStates[profile.id];
            const status = statusOverrides?.[profile.id] || state?.status || "answering";

            return (
            <PlayerStatus
                key={profile.id}
                playerUsername={profile.username}
                playerProfile={profile.profile_url}
                status={status}
            />
            );
        })}
        </div>
    )
}
