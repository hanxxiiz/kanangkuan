export type PlayerStatus = 
    "answering" |
    "done" |
    "correct" | 
    "wrong";

export interface PlayerInfo {
  id: string;
  username: string;
  avatarUrl: string;
}

export interface PlayerAnswer {
  answer: string;
  isCorrect: boolean;
}

export interface PlayerScore {
  correctCount: number;
  xpChange: number;
}

export interface PlayerGameState {
  user_id: string;
  status: "answering" | "done";
  answer?: string;
  correct?: boolean;
}

export interface GameResults {
  results: {
    user_id: string;
    correctCount: number;
    wrongCount: number;
    score: number;
  }[];
}

export interface GameState {
  phase: "answering" | "bet-and-bait" | "showing-results";
  players: Record<string, PlayerInfo>;
  playerAnswers: Record<string, PlayerAnswer | undefined>;
  playerScores: Record<string, PlayerScore | undefined>;
  // Optional fields to synchronize question flow across clients
  questionIndex?: number;
  questionEndsAt?: string; // ISO timestamp when the answering phase ends
}


