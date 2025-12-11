export interface Session {
    id: string;
    deck_id: string;
    host_id: string;
    session_code: string;
    question_count: number;
    status: string;
    current_question_index: number;
    started_at: string;
    created_at: string;
    expires_at: string;
}

export interface Participant {
    id: string;
    session_id: string;
    user_id: string;
    score: number;
    correct_answers: number;
    is_ready: boolean;
    joined_at: string;
}

export interface Question {
    id: string;
    session_id: string;
    question_index: number;
    question_id: string;
    question_data: {
        front: string;
        back: string;
        wrong_options: string[];
    };
    timer_start_at: string;
    timer_end_at: string;
    is_running: boolean;
}

export interface Response {
    id: string;
    session_id: string;
    participant_id: string;
    question_index: number;
    question_id: string;
    answer: string;
    is_correct: boolean;
    response_time: number;
    points_earned: number;
    answered_at: string;
}