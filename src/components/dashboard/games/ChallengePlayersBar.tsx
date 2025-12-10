"use client";

import React from 'react'
import PlayerStatus from './PlayerStatus';
import { PresencePayload } from '@/lib/hooks/useRealtimeChallenge';

type PlayerStatusType = PresencePayload["status"];

interface PlayerGameState {
    status: PresencePayload["status"];
    correct?: boolean;
}

export default function ChallengePlayersBar({
    profiles,
    players,
    showResults,
 } : { 
    profiles: { 
        id: string;
        username: string;
        avatar_url?: string;
    }[];
    players: Record<string, PlayerGameState>;
    showResults: boolean;
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
            const state = players[profile.id];
            
            let status: PlayerStatusType = "answering";

            if (showResults) {
                if (state?.status === "done" && state.correct === true) status = "correct";
                else if (state?.status === "done" && state.correct === false) status = "wrong";
                else if (state?.status === "done") status = "done";
            } else {
                if (state?.status === "done") status = "done"; 
            }

            const presence: PresencePayload | undefined = state ? {
                user_id: profile.id,
                status: status,
                updated_at: new Date().toISOString()
            } : undefined;

            return (
            <PlayerStatus
                key={profile.id}
                profile={{
                    id: profile.id,
                    profile_url: profile.avatar_url || "/dashboard/default-picture.png",
                    username: profile.username
                }}
                presence={presence}
                showResult={showResults}
            />
            );
        })}
        </div>
    )
}
