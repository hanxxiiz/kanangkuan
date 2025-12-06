"use client";

import React from 'react'
import PlayerStatus from './PlayerStatus';
import { PlayerGameState, PlayerStatus as PlayerStatusType } from '@/types/challenge-gameplay';

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

            return (
            <PlayerStatus
                key={profile.id}
                playerUsername={profile.username}
                playerProfile={profile.avatar_url}
                status={status}
            />
            );
        })}
        </div>
    )
}
