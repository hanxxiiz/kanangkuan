"use client";

import { useEffect, useState } from 'react'
import { challengeService } from '../services/challenge';
import { Question, Session } from '@/types/challenge';

export function useChallenges(challengeId?: string) {
  const [challenge, setChallenge] = useState<Session | null>(null); 
  const [challengeLoading, setChallengeLoading] = useState(true);
  const [challengeError, setChallengeError] = useState<string | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  useEffect(() => {
    if (challengeId) {
      loadSession();
      loadQuestions();
    }
  }, [challengeId]);

  async function loadSession() {
    if (!challengeId) return;

    try{
        setChallengeLoading(true);
        setChallengeError(null);
        const data = await challengeService.getSession(challengeId);
        setChallenge(data);
    } catch (err){
        setChallengeError (err instanceof Error ? err.message : "Failed to load challenge game.");
    } finally{
        setChallengeLoading(false);
    }
  }

  async function createChallenge(challengeData: {
    hostId: string,
    sessionCode: string,
    deckId: string,
    status: string,
  }) {
    try{
        const newChallenge = await challengeService.createSession({
            host_id: challengeData.hostId,
            session_code: challengeData.sessionCode,
            deck_id: challengeData.deckId,
            status: challengeData.status
        });
        setChallenge(newChallenge);
        return newChallenge;
    } catch (err) {
        console.error("Create challenge error:", err);
        setChallengeError (err instanceof Error ? err.message : "Failed to create challenge session.");
        return null;
    }
  }

  async function loadQuestions() {
    if (!challengeId) return;

    try {
        setQuestionsLoading(true);
        const data = await challengeService.getSessionQuestions(challengeId);
        setQuestions(data);
        
        if (data.length > 0) {
            setCurrentQuestion(data[0]);
        }
    } catch (err) {
        setChallengeError(err instanceof Error ? err.message : "Failed to load questions.");
    } finally {
        setQuestionsLoading(false);
    }
  }

  async function goToNextQuestion() {
    if (!challengeId || !questions.length) return;

    const nextIndex = currentQuestionIndex + 1;
    
    if (nextIndex >= questions.length) {
        console.log("No more questions");
        return false;
    }

    try {
        await challengeService.updateCurrentQuestionIndex(challengeId, nextIndex);
        setCurrentQuestionIndex(nextIndex);
        setCurrentQuestion(questions[nextIndex]);
        
        return true;
    } catch (err) {
        setChallengeError(err instanceof Error ? err.message : "Failed to go to next question.");
        return false;
    }
  }

  async function startTimer(durationSeconds: number = 15) {
    if (!challengeId) return false;

    try {
        await challengeService.startQuestionTimer(challengeId, currentQuestionIndex, durationSeconds);
        return true;
    } catch (err) {
        setChallengeError(err instanceof Error ? err.message : "Failed to start timer.");
        return false;
    }
  }

  async function stopTimer() {
    if (!challengeId) return false;

    try {
        await challengeService.stopQuestionTimer(challengeId, currentQuestionIndex);
        return true;
    } catch (err) {
        setChallengeError(err instanceof Error ? err.message : "Failed to stop timer.");
        return false;
    }
  }

  async function getTimerStatus() {
    if (!challengeId) return null;

    try {
        const status = await challengeService.getQuestionTimerStatus(challengeId, currentQuestionIndex);
        return status;
    } catch (err) {
        setChallengeError(err instanceof Error ? err.message : "Failed to get timer status.");
        return null;
    }
  }

  async function submitResponse(
    userId: string,
    questionId: string,
    answer: string,
    isCorrect: boolean,
    responseTime: number
  ) {
    if (!challengeId) return false;

    try {
      const participantId = await challengeService.getParticipantId(challengeId, userId);
      if (!participantId) {
        console.error("Participant ID not found");
        return false;
      }

      await challengeService.recordResponse({
        sessionId: challengeId,
        participantId,
        questionIndex: currentQuestionIndex,
        questionId,
        answer,
        isCorrect,
        responseTime,
      });

      return true;
    } catch (err) {
      setChallengeError(err instanceof Error ? err.message : "Failed to submit response.");
      return false;
    }
  }

  async function submitFakeAnswer(userId: string, fakeAnswer: string) {
    if (!challengeId) return false;

    try {
      await challengeService.submitFakeAnswer({
        sessionId: challengeId,
        userId,
        questionIndex: currentQuestionIndex,
        fakeAnswer: fakeAnswer || "kanang kuan"
      });
      return true;
    } catch (err) {
      setChallengeError(err instanceof Error ? err.message : "Failed to submit fake answer.");
      return false;
    }
  }

  async function refreshCurrentQuestion() {
    if (!challengeId) return;

    try {
      const updatedQuestion = await challengeService.getQuestionByIndex(challengeId, currentQuestionIndex);
      setCurrentQuestion(updatedQuestion);
      setQuestions(prev => {
        const newQuestions = [...prev];
        newQuestions[currentQuestionIndex] = updatedQuestion;
        return newQuestions;
      });
    } catch (err) {
      setChallengeError(err instanceof Error ? err.message : "Failed to refresh question.");
    }
  }

  async function insertParticipant(sessionId: string, userId: string) {
    try {
        const newHost = await challengeService.insertParticipant(sessionId, userId);
        return newHost;
    } catch (err) {
        setChallengeError(err instanceof Error ? err.message : "Failed to add host as participant.");
    }
  }

  async function generateUniqueJoinCode(): Promise<string> {
    try {
        return await challengeService.generateUniqueSessionCode();
    } catch (err) {
        setChallengeError(err instanceof Error ? err.message : "Failed to generate unique code.");
        throw err;
    }
  }

  async function validateJoinCode(joinCode: string): Promise<{ isValid: boolean; challengeId?: string; message?: string }> {
    try {
        const result = await challengeService.validateSessionCode(joinCode);
        return {
            isValid: result.isValid,
            challengeId: result.sessionId, 
            message: result.message
        };
    } catch (err) {
        setChallengeError(err instanceof Error ? err.message : "Failed to validate join code.");
        return { isValid: false, message: "Error validating code. Please try again." };
    }
  } 

  function syncQuestionByIndex(index: number) {
    if (questions.length > 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
      setCurrentQuestion(questions[index]);
    }
  }

  async function getUserFakeAnswer(userId: string): Promise<string | null> {
    if (!challengeId) return null;
    
    try {
      return await challengeService.getUserFakeAnswer(challengeId, userId, currentQuestionIndex);
    } catch (err) {
      console.error("Failed to get user's fake answer:", err);
      return null;
    }
  }

  async function startBetBaitTimer(durationSeconds: number = 15) {
    if (!challengeId) return false;

    try {
        await challengeService.startBetBaitTimer(challengeId, currentQuestionIndex, durationSeconds);
        return true;
    } catch (err) {
        setChallengeError(err instanceof Error ? err.message : "Failed to start Bet & Bait timer.");
        return false;
    }
}

async function stopBetBaitTimer() {
    if (!challengeId) return false;

    try {
        await challengeService.stopBetBaitTimer(challengeId, currentQuestionIndex);
        return true;
    } catch (err) {
        setChallengeError(err instanceof Error ? err.message : "Failed to stop Bet & Bait timer.");
        return false;
    }
}

async function getBetBaitTimerStatus() {
    if (!challengeId) return null;

    try {
        const status = await challengeService.getBetBaitTimerStatus(challengeId, currentQuestionIndex);
        return status;
    } catch (err) {
        setChallengeError(err instanceof Error ? err.message : "Failed to get Bet & Bait timer status.");
        return null;
    }
}

  return { 
    challenge, 
    challengeLoading, 
    challengeError, 
    questions,
    currentQuestion,
    currentQuestionIndex,
    questionsLoading,
    createChallenge,
    loadQuestions,
    goToNextQuestion,
    startTimer,
    stopTimer,
    getTimerStatus,
    startBetBaitTimer,      // ✅ NEW
    stopBetBaitTimer,       // ✅ NEW
    getBetBaitTimerStatus,  // ✅ NEW
    submitResponse,
    submitFakeAnswer,
    refreshCurrentQuestion,
    insertParticipant,
    generateUniqueJoinCode,
    validateJoinCode,
    setCurrentQuestion,
    setCurrentQuestionIndex,
    syncQuestionByIndex,
    getUserFakeAnswer
}
}