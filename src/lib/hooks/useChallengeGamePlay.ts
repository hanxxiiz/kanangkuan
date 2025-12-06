import { GameState, PlayerStatus } from '@/types/challenge-gameplay';
import React, { useCallback, useMemo } from 'react'

export function useChallengeGamePlay(gameState: GameState | null) {
    const getPlayerStatus = useCallback(
        (playerId: string): PlayerStatus => {
            if (!gameState) return "answering";

            const { phase, playerAnswers } = gameState;
            const answer = playerAnswers[playerId];

            if (!answer) {
                return "answering";
            }

            if (phase === "answering" || phase === "bet-and-bait") {
                return "done";
            }

            if (phase === "showing-results") {
                return answer.isCorrect ? "correct" : "wrong";
            }

            return "answering";
        },
        [gameState]
    );

    const playerStates = useMemo(() => {
        if (!gameState)
            return {};
        
        return Object.keys(gameState.players).reduce((acc, playerId) => {
        const answer = gameState.playerAnswers[playerId];
        const score = gameState.playerScores[playerId];

        acc[playerId] = {
            status: getPlayerStatus(playerId),
            answered: !!answer,
            score: score?.correctCount ?? 0,
            xpChange: score?.xpChange ?? 0,
        };

        return acc;
        }, {} as Record<
        string,
        {
            status: PlayerStatus;
            answered: boolean;
            score: number;
            xpChange: number;
        }
        >);
    }, [gameState, getPlayerStatus]);

    return {
        gameState,
        getPlayerStatus,
        playerStates,
    };
}
