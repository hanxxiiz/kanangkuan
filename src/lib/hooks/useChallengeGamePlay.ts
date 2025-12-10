"use client";

type GamePhase = 
    | "answering"
    | "showing-results"
    | "bet-and-bait-input"
    | "bet-and-bait-answering"
    | "bet-and-bait-results"
    | "game-over";

interface GameState {
    currentQuestionIndex: number;
    phase: GamePhase;
    isBetBaitRound: boolean;
    betBaitRounds: [];
    playerAnswers: Record<string, { answer: string; answeredAt: number }>;
    betBaitSubmissions: Record<string, { fakeAnswer: string; submittedAt: number }>;
    playerScores: Record<string, { correctCount: number; xpChange: number }>;
}   