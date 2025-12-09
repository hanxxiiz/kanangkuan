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

    async startBetBaitTimer(sessionId: string, questionIndex: number, durationSeconds: number): Promise<void> {
    const now = new Date();
    const endTime = new Date(now.getTime() + durationSeconds * 1000);

    const { error } = await supabase
        .schema("challenge")
        .from("questions")
        .update({
            bet_bait_timer_start_at: now.toISOString(),
            bet_bait_timer_end_at: endTime.toISOString(),
            is_bet_bait_timer_running: true,
            bet_bait_phase_completed: false,
        })
        .match({ session_id: sessionId, question_index: questionIndex });

    if (error) throw error;
},

// Stop Bet & Bait timer and mark phase as completed
async stopBetBaitTimer(sessionId: string, questionIndex: number): Promise<void> {
    const { error } = await supabase
        .schema("challenge")
        .from("questions")
        .update({
            is_bet_bait_timer_running: false,
            bet_bait_phase_completed: true,
        })
        .match({ session_id: sessionId, question_index: questionIndex });

    if (error) throw error;
},

// Get Bet & Bait timer status
async getBetBaitTimerStatus(sessionId: string, questionIndex: number): Promise<{
    bet_bait_timer_start_at: string | null;
    bet_bait_timer_end_at: string | null;
    is_bet_bait_timer_running: boolean;
    bet_bait_phase_completed: boolean;
}> {
    const { data, error } = await supabase
        .schema("challenge")
        .from("questions")
        .select("bet_bait_timer_start_at, bet_bait_timer_end_at, is_bet_bait_timer_running, bet_bait_phase_completed")
        .match({ session_id: sessionId, question_index: questionIndex })
        .single();

    if (error) throw error;

    return data;
},

    async submitFakeAnswer(data: {
  sessionId: string;
  userId: string;
  questionIndex: number;
  fakeAnswer: string;
}): Promise<void> {
  const { sessionId, userId, questionIndex, fakeAnswer } = data;
  
  console.log("🎲 Submitting fake answer to DB:", { sessionId, userId, questionIndex, fakeAnswer });

  // ✅ IMPORTANT: First check if this question already has wrong_options filled
  const { data: currentQuestion, error: checkError } = await supabase
    .schema("challenge")
    .from('questions')
    .select('question_data')
    .eq('session_id', sessionId)
    .eq('question_index', questionIndex)
    .single();

  if (checkError) {
    console.error("❌ Error checking question:", checkError);
    throw checkError;
  }

  // ✅ If wrong_options already filled, this round is over - don't accept new submissions
  const wrongOptions = currentQuestion?.question_data?.wrong_options;
  if (wrongOptions && Array.isArray(wrongOptions) && 
      !wrongOptions.some(opt => opt === null || opt === undefined)) {
    console.log("⚠️ Bet & Bait phase already completed for this question, ignoring submission");
    return;
  }

  // Insert fake answer with author tracking
  const { error: insertError } = await supabase
    .schema("challenge")
    .from('bet_and_bait_answers')
    .insert({
      session_id: sessionId,
      user_id: userId,
      question_index: questionIndex,
      fake_answer: fakeAnswer,
    });

  // Handle duplicate submission error gracefully
  if (insertError) {
    if (insertError.code === '23505') {
      console.log("⚠️ User already submitted for this question, skipping duplicate");
      return;
    }
    console.error("❌ Error inserting fake answer:", insertError);
    throw insertError;
  }

  console.log("✅ Fake answer inserted");

  // Get all fake answers for THIS SPECIFIC QUESTION
  const { data: fakeAnswers, error: fetchError } = await supabase
    .schema("challenge")
    .from('bet_and_bait_answers')
    .select('fake_answer, user_id')
    .eq('session_id', sessionId)
    .eq('question_index', questionIndex);

  if (fetchError) {
    console.error("❌ Error fetching fake answers:", fetchError);
    throw fetchError;
  }

  console.log("📋 Current fake answers for question", questionIndex, ":", fakeAnswers);

  // Get participant count (only active participants who are ready)
  const { data: participants, error: participantError } = await supabase
    .schema("challenge")
    .from('participants')
    .select('id')
    .eq('session_id', sessionId)
    .eq('is_ready', true);

  if (participantError) {
    console.error("❌ Error fetching participants:", participantError);
    throw participantError;
  }

  console.log(`👥 Participants: ${fakeAnswers.length}/${participants.length} submitted for question ${questionIndex}`);

  // If all participants have submitted FOR THIS QUESTION, update the question's wrong_options
  if (fakeAnswers.length === participants.length) {
    console.log("✅ All participants submitted for question", questionIndex, "! Updating question...");
    
    // Get fake answers
    let wrongOptions = fakeAnswers.map(fa => fa.fake_answer);
    
    // Pad with default answers if we have less than 3 participants
    let defaultCounter = 1;
    while (wrongOptions.length < 3) {
      wrongOptions.push(`kanang kuan (${defaultCounter})`);
      console.log(`➕ Adding default answer #${defaultCounter} (total participants: ${participants.length})`);
      defaultCounter++;
    }
    
    // If we have more than 3 participants, take only the first 3
    if (wrongOptions.length > 3) {
      wrongOptions = wrongOptions.slice(0, 3);
      console.log(`✂️ Trimming to 3 answers (from ${fakeAnswers.length})`);
    }
    
    console.log("📋 Final wrong_options:", wrongOptions);
    
    // Update the question_data with new wrong_options
    const updatedQuestionData = {
      ...currentQuestion.question_data,
      wrong_options: wrongOptions
    };

    console.log("🔄 Updating to:", updatedQuestionData);

    const { error: updateError } = await supabase
      .schema("challenge")
      .from('questions')
      .update({
        question_data: updatedQuestionData
      })
      .eq('session_id', sessionId)
      .eq('question_index', questionIndex);

    if (updateError) {
      console.error("❌ Error updating question:", updateError);
      throw updateError;
    }

    console.log("✅ Question", questionIndex, "updated with fake answers!");
  } else {
    console.log(`⏳ Waiting for more participants to submit (${fakeAnswers.length}/${participants.length})...`);
  }
},

async clearBetBaitAnswersForQuestion(
  sessionId: string, 
  questionIndex: number
): Promise<void> {
  const { error } = await supabase
    .schema("challenge")
    .from('bet_and_bait_answers')
    .delete()
    .eq('session_id', sessionId)
    .eq('question_index', questionIndex);

  if (error) {
    console.error("Error clearing bet & bait answers:", error);
    throw error;
  }
  
  console.log("✅ Cleared bet & bait answers for question", questionIndex);
},

// Get question by index (for refreshing after Bet & Bait)
async getQuestionByIndex(sessionId: string, questionIndex: number): Promise<Question> {
  const { data, error } = await supabase
    .schema("challenge")
    .from('questions')
    .select('*')
    .eq('session_id', sessionId)
    .eq('question_index', questionIndex)
    .single();

  if (error) throw error;
  return data;
},

// Get who submitted a fake answer (for baited modal)
async getFakeAnswerAuthor(
  sessionId: string,
  questionIndex: number,
  fakeAnswer: string
): Promise<string | null> {
  const { data, error } = await supabase
    .schema("challenge")
    .from('bet_and_bait_answers')
    .select('user_id')
    .eq('session_id', sessionId)
    .eq('question_index', questionIndex)
    .eq('fake_answer', fakeAnswer)
    .maybeSingle(); // Use maybeSingle to avoid error when no row found

  if (error) return null;
  return data?.user_id || null;
},

// Update scores when someone gets baited
async updateBaitScores(data: {
  sessionId: string;
  baitedUserId: string;
  baiterUserId: string;
  xpAmount: number;
}): Promise<void> {
  const { sessionId, baitedUserId, baiterUserId, xpAmount } = data;

  // Deduct points from baited player
  const { error: deductError } = await supabase.schema("challenge").rpc('update_participant_score', {
    p_session_id: sessionId,
    p_user_id: baitedUserId,
    p_score_change: -xpAmount
  });

  if (deductError) throw deductError;

  // Add points to baiter
  const { error: addError } = await supabase.schema("challenge").rpc('update_participant_score', {
    p_session_id: sessionId,
    p_user_id: baiterUserId,
    p_score_change: xpAmount
  });

  if (addError) throw addError;
},

// Update the recordResponse function in challenge.ts

async recordResponse(data: {
  sessionId: string;
  participantId: string;
  questionIndex: number;
  questionId: string;
  answer: string;
  isCorrect: boolean;
  responseTime: number;
  isOwnFakeAnswer?: boolean; // NEW: Flag for when user selects their own fake answer
}): Promise<void> {
  const { sessionId, participantId, questionIndex, questionId, answer, isCorrect, responseTime, isOwnFakeAnswer } = data;

  console.log("📧 Recording response:", data);

  // First, check if response already exists
  const { data: existingResponse, error: checkError } = await supabase
    .schema("challenge")
    .from('responses')
    .select('id')
    .eq('session_id', sessionId)
    .eq('participant_id', participantId)
    .eq('question_index', questionIndex)
    .maybeSingle();

  if (checkError) {
    console.error("❌ Error checking existing response:", checkError);
    throw checkError;
  }

  if (existingResponse) {
    console.log("⚠️ Response already exists for this question, skipping insert");
    return;
  }

  // Calculate points - NO POINTS if user selected their own fake answer
  let points = 0;
  if (isCorrect && !isOwnFakeAnswer) {
    const timeFactor = Math.max(0, 1 - (responseTime / 15000));
    points = Math.round(100 + (100 * timeFactor));
  }

  console.log("✅ Points calculated:", points, "isOwnFakeAnswer:", isOwnFakeAnswer);

  // Insert the response
  const { data: insertedResponse, error: insertError } = await supabase
    .schema("challenge")
    .from('responses')
    .insert({
      session_id: sessionId,
      participant_id: participantId,
      question_index: questionIndex,
      question_id: questionId,
      answer,
      is_correct: isCorrect && !isOwnFakeAnswer, // Mark as incorrect if own fake answer
      response_time: responseTime,
      points_earned: points,
    })
    .select();

  if (insertError) {
    console.error("❌ Error inserting response:", insertError);
    throw insertError;
  }

  console.log("✅ Response inserted:", insertedResponse);

  // Only update participant stats if NOT selecting own fake answer
  if (!isOwnFakeAnswer) {
    // FIX: Use correct parameter name (p_response_time instead of p_session_id)
    const { error: updateError } = await supabase.schema("challenge").rpc('update_participant_stats', {
      p_participant_id: participantId,
      p_points: points,
      p_is_correct: isCorrect,
      p_response_time: responseTime // FIXED: Added missing parameter
    });

    if (updateError) {
      console.error("❌ Error updating stats:", updateError);
      throw updateError;
    }

    console.log("✅ Participant stats updated");

    // Update rankings
    const { error: rankError } = await supabase.schema("challenge").rpc('update_session_rankings', {
      p_session_id: sessionId
    });

    if (rankError) {
      console.error("❌ Error updating rankings:", rankError);
      // Don't throw here, rankings are not critical
    } else {
      console.log("✅ Rankings updated");
    }
  } else {
    console.log("⚠️ Skipping stats update - user selected their own fake answer");
  }
},

// NEW: Get user's submitted fake answer for a question
async getUserFakeAnswer(
  sessionId: string,
  userId: string,
  questionIndex: number
): Promise<string | null> {
  const { data, error } = await supabase
    .schema("challenge")
    .from('bet_and_bait_answers')
    .select('fake_answer')
    .eq('session_id', sessionId)
    .eq('user_id', userId)
    .eq('question_index', questionIndex)
    .maybeSingle(); // Use maybeSingle to avoid error when no row found

  if (error) {
    console.error("Error fetching user's fake answer:", error);
    return null;
  }
  
  return data?.fake_answer || null;
},

// NEW: Count how many players fell for a user's fake answer
async countBaitedPlayers(
  sessionId: string,
  questionIndex: number,
  fakeAnswer: string
): Promise<{ count: number; baitedUserIds: string[] }> {
  // Get all responses for this question where the answer matches the fake answer
  const { data: responses, error } = await supabase
    .schema("challenge")
    .from('responses')
    .select('participant_id')
    .eq('session_id', sessionId)
    .eq('question_index', questionIndex)
    .eq('answer', fakeAnswer)
    .eq('is_correct', false);

  if (error) {
    console.error("Error counting baited players:", error);
    return { count: 0, baitedUserIds: [] };
  }

  // Get user IDs from participant IDs
  const participantIds = responses?.map(r => r.participant_id) || [];
  
  if (participantIds.length === 0) {
    return { count: 0, baitedUserIds: [] };
  }

  const { data: participants, error: pError } = await supabase
    .schema("challenge")
    .from('participants')
    .select('user_id')
    .in('id', participantIds);

  if (pError) {
    console.error("Error fetching participants:", pError);
    return { count: responses?.length || 0, baitedUserIds: [] };
  }

  const baitedUserIds = participants?.map(p => p.user_id) || [];
  
  return { 
    count: baitedUserIds.length, 
    baitedUserIds 
  };
},

// NEW: Get bet & bait results for a player after a round
async getBetAndBaitResults(
  sessionId: string,
  questionIndex: number,
  userId: string,
  userFakeAnswer: string | null
): Promise<{
  wasBaited: boolean;
  baiterUserId: string | null;
  baitedOthers: boolean;
  baitedCount: number;
  xpChange: number;
}> {
  // Check if user was baited (their response matches someone else's fake answer)
  const { data: userResponse, error: responseError } = await supabase
    .schema("challenge")
    .from('responses')
    .select('answer, is_correct')
    .eq('session_id', sessionId)
    .eq('question_index', questionIndex)
    .eq('participant_id', (await this.getParticipantId(sessionId, userId)))
    .single();

  if (responseError) {
    console.error("Error fetching user response:", responseError);
  }

  let wasBaited = false;
  let baiterUserId: string | null = null;
  let baitedOthers = false;
  let baitedCount = 0;
  let xpChange = 0;

  // Check if user got baited (wrong answer that's not their own fake answer)
  if (userResponse && !userResponse.is_correct && userResponse.answer !== userFakeAnswer) {
    // Check if their answer was someone's fake answer
    baiterUserId = await this.getFakeAnswerAuthor(sessionId, questionIndex, userResponse.answer);
    if (baiterUserId && baiterUserId !== userId) {
      wasBaited = true;
      xpChange -= 20;
    }
  }

  // Check if user's fake answer baited others
  if (userFakeAnswer) {
    const baitResult = await this.countBaitedPlayers(sessionId, questionIndex, userFakeAnswer);
    // Exclude if the user baited themselves
    const actualBaited = baitResult.baitedUserIds.filter(id => id !== userId);
    if (actualBaited.length > 0) {
      baitedOthers = true;
      baitedCount = actualBaited.length;
      xpChange += baitedCount * 20;
    }
  }

  return {
    wasBaited,
    baiterUserId,
    baitedOthers,
    baitedCount,
    xpChange
  };
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