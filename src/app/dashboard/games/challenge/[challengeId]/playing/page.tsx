"use client";

import AnswerOption from '@/components/dashboard/games/AnswerOption';
import PlayerStatus from '@/components/dashboard/games/PlayerStatus';
import Question from '@/components/dashboard/games/Question';
import BetAndBaitInput from '@/components/dashboard/games/BetAndBaitInput';
import BetAndBaitResults from '@/components/dashboard/games/BetAndBaitResults';
import { useChallenges } from '@/lib/hooks/useChallenges';
import { useProfiles } from '@/lib/hooks/useProfile';
import { useRealtimeChallenge } from '@/lib/hooks/useRealtimeChallenge';
import { useUser } from '@/lib/hooks/useUser';
import React, { useMemo, useState, useEffect, useRef } from 'react'

export interface PresencePayload {
  user_id: string;
  status: "answering" | "done" | "correct" | "wrong" | "submitting_fake";
  updated_at: string;
}

export default function ChallengePlay({ params }: {
  params: Promise<{ challengeId: string }>;
}) {
    const { challengeId } = React.use(params);
    const { user } = useUser();
    
    const { 
        challenge,
        challengeLoading,
        challengeError,
        currentQuestion,
        currentQuestionIndex,
        questions,
        questionsLoading,
        goToNextQuestion,
        startTimer,
        getTimerStatus,
        syncQuestionByIndex,
        submitResponse,
        submitFakeAnswer,
        refreshCurrentQuestion,
        getUserFakeAnswer, // NEW
    } = useChallenges(challengeId);

    const { presence, timerState, sessionState, updatePlayerStatus } = useRealtimeChallenge({
        challengeId,
        userId: user?.id || '',
    })

    const { profiles } = useProfiles({ userIds: Object.keys(presence) });

    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [timer, setTimer] = useState(15);
    const [isTimerEnded, setIsTimerEnded] = useState(false);
    const [answerTime, setAnswerTime] = useState<number | null>(null);
    const hasSubmittedRef = useRef(false);

    // Bet & Bait state
    const [isBetAndBaitMode, setIsBetAndBaitMode] = useState(false);
    const [showBetAndBaitInput, setShowBetAndBaitInput] = useState(false);
    const [betAndBaitSubmitted, setBetAndBaitSubmitted] = useState(false);
    const [showBaitedModal, setShowBaitedModal] = useState(false);
    const [baitedInfo, setBaitedInfo] = useState<{ baiterName: string; xpLost: number } | null>(null);
    const [wasOriginallyBetAndBait, setWasOriginallyBetAndBait] = useState(false);
    const [isLoadingFakeAnswers, setIsLoadingFakeAnswers] = useState(false);
    const [userFakeAnswer, setUserFakeAnswer] = useState<string | null>(null); // NEW: Store user's fake answer
    const fakeAnswerSubmittedRef = useRef(false);

    const isHost = user?.id === challenge?.host_id;

    // Check if current question is Bet & Bait (null wrong_options)
    const isBetAndBaitQuestion = useMemo(() => {
        if (!currentQuestion?.question_data) return false;
        const wrongOptions = currentQuestion.question_data.wrong_options;
        
        // Check if wrong_options is null, empty array, or array of nulls
        if (wrongOptions === null || (Array.isArray(wrongOptions) && wrongOptions.length === 0)) {
            return true;
        }
        
        // Check if it's an array containing only null/undefined values
        if (Array.isArray(wrongOptions) && wrongOptions.every(opt => opt === null || opt === undefined)) {
            return true;
        }
        
        return false;
    }, [currentQuestion]);

    // DEBUG: Current Question Data
    useEffect(() => {
        if (currentQuestion) {
            console.log("📋 Current Question Full Data:", JSON.stringify(currentQuestion, null, 2));
        }
    }, [currentQuestion]);

    // DEBUG: Question Detection
    useEffect(() => {
        console.log("🔍 Question Debug:", {
            questionId: currentQuestion?.id,
            isBetAndBaitQuestion,
            wrongOptions: currentQuestion?.question_data?.wrong_options,
            isBetAndBaitMode,
            showBetAndBaitInput
        });
    }, [currentQuestion?.id, isBetAndBaitQuestion, isBetAndBaitMode, showBetAndBaitInput]);

    // DEBUG: User & Host Info
    useEffect(() => {
        console.log("👤 User Info:", {
            userId: user?.id,
            hostId: challenge?.host_id,
            isHost
        });
    }, [user?.id, challenge?.host_id, isHost]);

    // DEBUG: Timer State
    useEffect(() => {
        console.log("⏰ Timer State:", {
            timerState,
            isTimerEnded,
            timer
        });
    }, [timerState, isTimerEnded, timer]);

    const shuffledOptions = useMemo(() => {
        if (!currentQuestion?.question_data) return [];
        
        const { back, wrong_options } = currentQuestion.question_data;
        
        // Don't shuffle during Bet & Bait input phase
        if (isBetAndBaitMode) return [];
        
        const allOptions = [back, ...(wrong_options || [])].filter(Boolean);
        return allOptions.sort(() => Math.random() - 0.5);
    }, [currentQuestion, isBetAndBaitMode]);

    useEffect(() => {
        if (!sessionState || isHost) return;
        if (sessionState.current_question_index !== currentQuestionIndex) {
            syncQuestionByIndex(sessionState.current_question_index);
        }
    }, [sessionState, isHost, currentQuestionIndex]);

    useEffect(() => {
        if (!timerState?.timer_end_at || !timerState?.is_timer_running) {
            if (timerState?.timer_end_at && !timerState?.is_timer_running) {
                setIsTimerEnded(true);
            }
            return;
        }

        setIsTimerEnded(false);

        const endTime = new Date(timerState.timer_end_at).getTime();
        
        const updateTimer = () => {
            const now = Date.now();
            const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
            
            setTimer(remaining);
            
            if (remaining === 0) {
                setIsTimerEnded(true);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 100);

        return () => clearInterval(interval);
    }, [timerState]);

    // Initialize question (Bet & Bait or regular) - FOR HOST ONLY
    useEffect(() => {
        if (!currentQuestion?.id || !isHost || questionsLoading) {
            console.log("❌ Skipping host init:", { 
                hasQuestion: !!currentQuestion?.id, 
                isHost, 
                questionsLoading 
            });
            return;
        }

        console.log("🎬 Host initializing question...");

        const initQuestion = async () => {
            if (isBetAndBaitQuestion) {
                console.log("🎲 Starting Bet & Bait mode (HOST)");
                // Start Bet & Bait mode
                setIsBetAndBaitMode(true);
                setShowBetAndBaitInput(true);
                setBetAndBaitSubmitted(false);
                setWasOriginallyBetAndBait(true);
                setIsTimerEnded(false);
                
                const status = await getTimerStatus();
                if (!status?.is_timer_running && !status?.timer_start_at) {
                    await startTimer(15);
                }
            } else {
                console.log("📝 Starting regular question (HOST)");
                // Regular question
                setIsTimerEnded(false);
                const status = await getTimerStatus();
                if (!status?.is_timer_running && !status?.timer_start_at) {
                    await startTimer(15);
                } else if (status?.is_timer_running) {
                    setIsTimerEnded(false);
                } else {
                    setIsTimerEnded(true);
                }
            }
        };

        const timeout = setTimeout(initQuestion, 100);
        return () => clearTimeout(timeout);
    }, [currentQuestion?.id, isHost, questionsLoading, isBetAndBaitQuestion]);

    // Reset state on question change
    useEffect(() => {
    console.log("🔄 Question changed, resetting state...", {
        questionId: currentQuestion?.id,
        isBetAndBaitQuestion
    });

    setSelectedAnswer(null);
    setIsTimerEnded(false);
    setAnswerTime(null);
    hasSubmittedRef.current = false;
    fakeAnswerSubmittedRef.current = false; // ✅ ADD THIS LINE
    setShowBaitedModal(false);
    setBaitedInfo(null);
    setUserFakeAnswer(null);
    
    if (isBetAndBaitQuestion) {
        console.log("🎲 Setting Bet & Bait mode for ALL players");
        setIsBetAndBaitMode(true);
        setShowBetAndBaitInput(true);
        setBetAndBaitSubmitted(false);
        setWasOriginallyBetAndBait(true);
        updatePlayerStatus("submitting_fake");
    } else {
        console.log("📝 Setting regular question mode");
        setIsBetAndBaitMode(false);
        setShowBetAndBaitInput(false);
        setWasOriginallyBetAndBait(false);
        updatePlayerStatus("answering");
    }
}, [currentQuestion?.id, isBetAndBaitQuestion]);

    // NEW: Fetch user's fake answer when Bet & Bait mode ends
    useEffect(() => {
        if (wasOriginallyBetAndBait && !isBetAndBaitMode && user?.id) {
            const fetchFakeAnswer = async () => {
                const fakeAnswer = await getUserFakeAnswer(user.id);
                setUserFakeAnswer(fakeAnswer);
                console.log("💾 User's fake answer retrieved:", fakeAnswer);
            };
            fetchFakeAnswer();
        }
    }, [wasOriginallyBetAndBait, isBetAndBaitMode, user?.id]);

    // Handle Bet & Bait fake answer submission
    const handleFakeAnswerSubmit = async (fakeAnswer: string) => {
    console.log("✏️ Submitting fake answer:", fakeAnswer);
    
    // Prevent double submissions
    if (!user?.id || betAndBaitSubmitted || fakeAnswerSubmittedRef.current) {
        console.log("❌ Already submitted or no user");
        return;
    }
    
    fakeAnswerSubmittedRef.current = true;
    setBetAndBaitSubmitted(true);
    setUserFakeAnswer(fakeAnswer);
    
    try {
        const result = await submitFakeAnswer(user.id, fakeAnswer);
        console.log("✅ Fake answer submitted, result:", result);
        await updatePlayerStatus("done");
    } catch (error) {
        console.error("❌ Failed to submit fake answer:", error);
        // Reset on error so user can try again
        fakeAnswerSubmittedRef.current = false;
        setBetAndBaitSubmitted(false);
    }
};

    // Close Bet & Bait modal when timer ends and refresh question
    useEffect(() => {
        if (isTimerEnded && isBetAndBaitMode && showBetAndBaitInput) {
            console.log("⏰ Bet & Bait timer ended, waiting for all submissions...");
            const closeModal = async () => {
                setIsLoadingFakeAnswers(true);
                
                // Wait longer for all submissions to complete and DB to update
                await new Promise(resolve => setTimeout(resolve, 4000));
                
                console.log("🔄 Closing modal and refreshing question...");
                setShowBetAndBaitInput(false);
                
                // Refresh question to get updated wrong_options
                await refreshCurrentQuestion();
                
                console.log("📋 Question refreshed, checking wrong_options...");
                
                // Exit Bet & Bait mode
                setIsBetAndBaitMode(false);
                setIsLoadingFakeAnswers(false);
                await updatePlayerStatus("answering");
                
                // Restart timer for actual question (HOST ONLY)
                if (isHost) {
                    console.log("🎬 Host restarting timer for main question...");
                    await new Promise(resolve => setTimeout(resolve, 500));
                    await startTimer(15);
                    setIsTimerEnded(false);
                }
            };
            
            closeModal();
        }
    }, [isTimerEnded, isBetAndBaitMode, showBetAndBaitInput, isHost]);

    const handleAnswerSelect = async (answer: string) => {
        if (isTimerEnded || isBetAndBaitMode) return;
        
        console.log("✅ Answer selected:", answer);
        setSelectedAnswer(answer);
        if (!answerTime && timerState?.timer_start_at) {
            const startTime = new Date(timerState.timer_start_at).getTime();
            const currentTime = Date.now();
            const responseTimeMs = currentTime - startTime;
            setAnswerTime(responseTimeMs);
        }

        await updatePlayerStatus("done");
    };

    useEffect(() => {
        if (!isTimerEnded || !user?.id || !currentQuestion || isBetAndBaitMode) return;
        if (hasSubmittedRef.current) return;

        // Safety check: Don't submit if wrong_options still has nulls (Bet & Bait not complete)
        if (wasOriginallyBetAndBait) {
            const wrongOptions = currentQuestion?.question_data?.wrong_options;
            if (Array.isArray(wrongOptions) && wrongOptions.some(opt => opt === null || opt === undefined)) {
                console.log("⏸️ Bet & Bait answers not ready yet, skipping submission");
                return;
            }
            
            if (Array.isArray(wrongOptions) && wrongOptions.every(opt => opt === null || opt === undefined)) {
                console.log("⏸️ All wrong options are null, skipping submission");
                return;
            }
        }

        hasSubmittedRef.current = true;
        console.log("🔒 hasSubmittedRef set to true to prevent duplicate submissions");

        const submitAnswer = async () => {
            if (selectedAnswer) {
                const isCorrect = selectedAnswer === currentQuestion?.question_data?.back;
                const responseTime = answerTime || 15000;
                
                // NEW: Check if user selected their own fake answer
                const isOwnFakeAnswer = userFakeAnswer && selectedAnswer === userFakeAnswer;
                
                console.log("📤 Submitting answer:", { 
                    selectedAnswer, 
                    isCorrect,
                    isOwnFakeAnswer,
                    userFakeAnswer,
                    wasOriginallyBetAndBait,
                    hasSubmitted: hasSubmittedRef.current
                });

                // Don't show any result if user selected their own fake answer
                if (isOwnFakeAnswer) {
                    await updatePlayerStatus("done");
                    console.log("⚠️ User selected their own fake answer - neutral result");
                } else {
                    await updatePlayerStatus(isCorrect ? "correct" : "wrong");
                }
                
                try {
                    await submitResponse(
                        user.id,
                        currentQuestion.question_id,
                        selectedAnswer,
                        isCorrect,
                        responseTime
                    );
                    console.log("✅ Response successfully submitted");
                } catch (error) {
                    console.error("❌ Error submitting response:", error);
                    hasSubmittedRef.current = false;
                    return;
                }
                
                // ONLY show baited modal if:
                // 1. This was originally a Bet & Bait question
                // 2. The player selected a wrong answer
                // 3. The player did NOT select their own fake answer
                if (!isCorrect && selectedAnswer && wasOriginallyBetAndBait && !isOwnFakeAnswer) {
                    console.log("😱 Player was baited!");
                    // TODO: Get the baiter's info from backend
                    setBaitedInfo({
                        baiterName: "Someone",
                        xpLost: 20
                    });
                    setShowBaitedModal(true);
                    
                    // Hide modal after 3 seconds
                    setTimeout(() => {
                        setShowBaitedModal(false);
                    }, 3000);
                }
                
                console.log("🎯 Response submitted:", { answer: selectedAnswer, isCorrect, responseTime });
            } else {
                await updatePlayerStatus("wrong");
                
                try {
                    await submitResponse(
                        user.id,
                        currentQuestion.question_id,
                        "",
                        false,
                        15000
                    );
                    console.log("✅ No answer response submitted");
                } catch (error) {
                    console.error("❌ Error submitting no-answer response:", error);
                    hasSubmittedRef.current = false;
                    return;
                }
                
                console.log("🎯 No answer submitted (marked wrong)");
            }
        };

        submitAnswer();
    }, [isTimerEnded, selectedAnswer, user?.id, currentQuestion?.id, currentQuestion?.question_data?.wrong_options, isBetAndBaitMode, wasOriginallyBetAndBait, userFakeAnswer]);

    const handleNextQuestion = async () => {
        console.log("➡️ Moving to next question...");
        await updatePlayerStatus("answering");
        
        const success = await goToNextQuestion();
        if (!success) {
            await updatePlayerStatus("done");
            alert("No more questions! Challenge complete.");
        }
    };

    if (!user) { 
        return <div className="min-h-screen flex items-center justify-center">
            <p className="font-main text-xl">Loading user...</p>
        </div>; 
    }

    if (challengeLoading || !challenge) {
        return <div className="min-h-screen flex items-center justify-center">
            <p className="text-white font-main text-xl">Loading challenge...</p>
        </div>;
    }

    if (questionsLoading) {
        return <div className="min-h-screen flex items-center justify-center">
            <p className="font-main text-xl">Loading questions...</p>
        </div>;
    }

    console.log("🎨 Rendering - showBetAndBaitInput:", showBetAndBaitInput);

    return (
        <div className="min-h-screen flex flex-col">
            {/* Loading Overlay for Bet & Bait processing */}
            {isLoadingFakeAnswers && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                        <p className="font-main text-xl">Processing fake answers...</p>
                    </div>
                </div>
            )}

            {/* Bet & Bait Input Modal */}
            {showBetAndBaitInput && (
                <BetAndBaitInput
                    show={showBetAndBaitInput}
                    timer={timer}
                    question={currentQuestion?.question_data?.front || ""}
                    onSubmit={handleFakeAnswerSubmit}
                    isTimerEnded={isTimerEnded}
                />
            )}

            {/* Baited Modal - Only show for Bet & Bait questions when user got baited */}
            {baitedInfo && wasOriginallyBetAndBait && (
                <BetAndBaitResults
                    show={showBaitedModal}
                    baiterName={baitedInfo.baiterName}
                    xpLost={baitedInfo.xpLost}
                />
            )}

            <div className="flex flex-col items-center space-y-5 w-full flex-1">
                <div className="flex flex-row items-center justify-center gap-5 mt-10">
                    <div className="flex flex-row justify-start gap-4 p-4 rounded-lg overflow-x-auto">
                        {profiles.map((profile) => (
                            <PlayerStatus
                                key={profile.id}
                                profile={profile}
                                presence={presence[profile.id]}
                                showResult={isTimerEnded && !isBetAndBaitMode}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row w-full h-full lg:px-20 p-5 mb-5 lg:mb-25 flex-1 lg:gap-10 gap-3">
                    <div className="w-full flex justify-center mb-3">
                        <div className={`text-xl lg:text-2xl font-main ${timer <= 5 ? 'text-red-500' : 'text-black'}`}>
                            {timer}s
                        </div>
                    </div>

                    <div
                        className="flex-1 h-auto flex items-center justify-center rounded-3xl p-10 border border-black"
                        style={{ opacity: isBetAndBaitMode ? 0.3 : 1, pointerEvents: isBetAndBaitMode ? 'none' : 'auto' }}
                    >
                        <Question text={currentQuestion?.question_data?.front || "Loading..."} />
                    </div>

                    <div className="flex flex-col flex-1 justify-between gap-3 lg:gap-5"
                         style={{ opacity: isBetAndBaitMode ? 0.3 : 1, pointerEvents: isBetAndBaitMode ? 'none' : 'auto' }}>
                        {!isBetAndBaitMode && shuffledOptions.map((option, index) => {
                            const isSelected = selectedAnswer === option;
                            const isCorrectAnswer = option === currentQuestion?.question_data?.back;
                            const isUserFakeAnswer = userFakeAnswer && option === userFakeAnswer; // NEW
                            
                            let buttonClass = "";
                            
                            if (isTimerEnded && isSelected) {
                                // NEW: Show neutral color for own fake answer
                                if (isUserFakeAnswer) {
                                    buttonClass = "bg-gray-400 text-black border-gray-400";
                                } else {
                                    buttonClass = isCorrectAnswer 
                                        ? "bg-lime text-black border-lime" 
                                        : "bg-pink text-black border-pink";
                                }
                            } else if (isSelected) {
                                buttonClass = "bg-cyan text-black border-cyan";
                            }
                            
                            return (
                                <AnswerOption 
                                    key={index}
                                    text={option}
                                    onSelect={() => handleAnswerSelect(option)}
                                    disabled={isTimerEnded || isBetAndBaitMode}
                                    className={buttonClass}
                                />
                            );
                        })}
                        
                        {isHost && isTimerEnded && !isBetAndBaitMode && (
                            <button
                                onClick={handleNextQuestion}
                                className="mt-5 p-4 bg-black text-white font-main rounded-2xl hover:scale-105 transition-transform"
                            >
                                Next Question
                            </button>
                        )}
                        
                        {!isHost && isTimerEnded && !isBetAndBaitMode && (
                            <div className="mt-5 p-4 bg-gray-300 text-gray-600 font-main rounded-2xl text-center">
                                Waiting for host...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}