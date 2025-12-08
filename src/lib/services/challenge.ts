import { Question, Session } from "@/types/challenge";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export const challengeService = {
    async createSession(
        session: Omit<Session, "id" | "question_count" | "current_question_index" | "started_at" | "created_at" | "expires_at">
    ): Promise<Session> {
        const { data, error } = await supabase
            .schema("challenge")
            .from("sessions")
            .insert(session)
            .select()
            .single();

        if (error) throw error;

        return data;
    },

    async insertParticipant(sessionId: string, userId: string): Promise<void> {
        const {data, error } = await supabase
            .schema("challenge")
            .from("participants")
            .insert({
                session_id: sessionId,
                user_id: userId,
            })
            .select()
            .single();

        if (error) throw error;

        return data;
    },

    async removeParticipant (sessionId: string, userId: string): Promise<void> {
        const { data, error } = await supabase
            .schema("challenge")
            .from("participants")
            .delete()
            .match({ session_id: sessionId,  user_id: userId, is_ready: false });

        if (error) throw error;
    },

    async updateGameStatus(sessionId: string, status: string): Promise<void> {
        const { data, error } = await supabase
            .schema("challenge")
            .from("sessions")
            .update({ status, started_at: new Date().toISOString() })
            .eq("id", sessionId);

        if (error) throw error;
    },

    async markPlayerReady(sessionId: string, userId: string): Promise<void> {
        const { data, error } = await supabase
            .schema("challenge")
            .from("participants")
            .update({ is_ready: true })
            .match({ session_id: sessionId, user_id: userId });

        if (error) throw error;
    },  

    async getSession(sessionId: string): Promise<Session> {
        const { data, error } = await supabase
            .schema("challenge")
            .from("sessions")
            .select("*")
            .eq("id", sessionId)
            .single();

        if (error) throw error;

        return data;
    },

    async getSessionQuestions(sessionId: string): Promise<Question[]> {
        const { data, error } = await supabase
            .schema("challenge")
            .from("questions")
            .select("*")
            .eq("session_id", sessionId)
            .order("question_index", { ascending: true });

        if (error) throw error;

        return data || [];
    },

    async getCurrentQuestion(sessionId: string, questionIndex: number): Promise<Question> {
        const { data, error } = await supabase
            .schema("challenge")
            .from("questions")
            .select("*")
            .eq("session_id", sessionId)
            .eq("question_index", questionIndex)
            .single();

        if (error) throw error;

        return data;
    },

    async updateCurrentQuestionIndex(sessionId: string, newIndex: number): Promise<void> {
        const { error } = await supabase
            .schema("challenge")
            .from("sessions")
            .update({ current_question_index: newIndex })
            .eq("id", sessionId);

        if (error) throw error;
    },

    async startQuestionTimer(sessionId: string, questionIndex: number, durationSeconds: number): Promise<void> {
        const now = new Date();
        const endTime = new Date(now.getTime() + durationSeconds * 1000);

        const { error } = await supabase
            .schema("challenge")
            .from("questions")
            .update({
                timer_start_at: now.toISOString(),
                timer_end_at: endTime.toISOString(),
                is_timer_running: true,
            })
            .match({ session_id: sessionId, question_index: questionIndex });

        if (error) throw error;
    },

    async stopQuestionTimer(sessionId: string, questionIndex: number): Promise<void> {
        const { error } = await supabase
            .schema("challenge")
            .from("questions")
            .update({
                is_timer_running: false,
            })
            .match({ session_id: sessionId, question_index: questionIndex });

        if (error) throw error;
    },

    async getQuestionTimerStatus(sessionId: string, questionIndex: number): Promise<{
        timer_start_at: string | null;
        timer_end_at: string | null;
        is_timer_running: boolean;
    }> {
        const { data, error } = await supabase
            .schema("challenge")
            .from("questions")
            .select("timer_start_at, timer_end_at, is_timer_running")
            .match({ session_id: sessionId, question_index: questionIndex })
            .single();

        if (error) throw error;

        return data;
    },

    async getParticipantId(sessionId: string, userId: string): Promise<string | null> {
        const { data, error } = await supabase
            .schema("challenge")
            .from("participants")
            .select("id")
            .match({ session_id: sessionId, user_id: userId })
            .single();  
        
        if (error) throw error;

        return data.id || null;
    },

    async recordResponse(response: {
        sessionId: string;
        participantId: string;
        questionIndex: number;
        questionId: string;
        answer: string;
        isCorrect: boolean;
        responseTime: number;
    }): Promise<void> {
        console.log("🔧 Recording response:", response);

        const { data: pointsData, error: pointsError } = await supabase
            .schema("challenge")
            .rpc("calculate_points", {
                is_correct: response.isCorrect,
                response_time: response.responseTime,
                time_limit: 15
            });
            
            if (pointsError) {
                console.error("❌ Error calculating points:", pointsError);
                throw pointsError;
            }

            console.log("✅ Points calculated:", pointsData);

            const points = pointsData || 0;

            const { data: insertData, error: insertError } = await supabase
                .schema("challenge")
                .from("responses")
                .insert({
                    session_id: response.sessionId,
                    participant_id: response.participantId,
                    question_index: response.questionIndex,
                    question_id: response.questionId,
                    answer: response.answer,
                    is_correct: response.isCorrect,
                    response_time: response.responseTime,
                    points_earned: points,
                })
                .select();

            if (insertError) {
                console.error("❌ Error inserting response:", insertError);
                throw insertError;
            }

            console.log("✅ Response inserted:", insertData);

            // Update participant stats
            const { data: updateData, error: updateError } = await supabase
                .schema("challenge")
                .rpc('update_participant_stats', {
                    p_participant_id: response.participantId,
                    p_is_correct: response.isCorrect,
                    p_response_time: response.responseTime,
                    p_points: points,
                });

            if (updateError) {
                console.error("❌ Error updating participant stats:", updateError);
                throw updateError;
            }

            console.log("✅ Participant stats updated");

            // Update session rankings
            const { data: rankData, error: rankError } = await supabase
                .schema("challenge")
                .rpc('update_session_rankings', {
                    p_session_id: response.sessionId,
                });

            if (rankError) {
                console.error("⚠️ Error updating rankings:", rankError);
                // Don't throw - rankings update is not critical
            } else {
                console.log("✅ Rankings updated");
            }
    },

    async checkSessionCodeExists(sessionCode: string): Promise<boolean> {
        const { data, error } = await supabase
            .schema("challenge")
            .from("sessions")
            .select("session_code")
            .eq("session_code", sessionCode)
            .maybeSingle();

        if (error) throw error;

        return data !== null;
    },

    async generateUniqueSessionCode(): Promise<string> {
        const generateCode = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let code = '';
            for (let i = 0; i < 5; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return code;
        };

        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
            const code = generateCode();
            const exists = await this.checkSessionCodeExists(code);
            
            if (!exists) {
                return code;
            }
            
            attempts++;
        }

        throw new Error("Failed to generate unique code after multiple attempts");
    },

    async validateSessionCode(sessionCode: string): Promise<{ isValid: boolean; sessionId?: string; message?: string }> {
        const { data: session, error: sessionError } = await supabase
            .schema("challenge")
            .from("sessions")
            .select("id, status")
            .eq("session_code", sessionCode)
            .maybeSingle();

        if (sessionError) {
            return { isValid: false, message: "Error validating code. Please try again." };
        }

        if (!session) {
            return { isValid: false, message: "Invalid join code. Please check and try again." };
        }

        if (session.status !== "waiting") {
            return { isValid: false, message: "This challenge is no longer available." };
        }

        const { count, error: countErr } = await supabase
            .schema("challenge")
            .from("participants")
            .select("*", { count: "exact", head: true })
            .eq("session_id", session.id);

        if (countErr) {
            return { isValid: false, message: "Unable to check participants. Try again." };
        }

        if (count! >= 3) {
            return { isValid: false, message: "This session already has the maximum number of players (3)." };
        }

        return {
            isValid: true,
            sessionId: session.id,
        };
    }
}