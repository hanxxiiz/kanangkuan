"use client";

import AnswerOption from '@/components/dashboard/games/AnswerOption';
import PlayerStatus from '@/components/dashboard/games/PlayerStatus';
import Question from '@/components/dashboard/games/Question';
import { useChallenges } from '@/lib/hooks/useChallenges';
import { useProfiles } from '@/lib/hooks/useProfile';
import { useRealtimeChallenge } from '@/lib/hooks/useRealtimeChallenge';
import { useUser } from '@/lib/hooks/useUser';
import React, { useMemo, useState, useEffect, useRef } from 'react'

export interface PresencePayload {
  user_id: string;
  status: "answering" | "done" | "correct" | "wrong";
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
        submitResponse
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

    const isHost = user?.id === challenge?.host_id;

    const shuffledOptions = useMemo(() => {
        if (!currentQuestion?.question_data) return [];
        
        const { back, wrong_options } = currentQuestion.question_data;
        const allOptions = [back, ...(wrong_options || [])].filter(Boolean);
        return allOptions.sort(() => Math.random() - 0.5);
    }, [currentQuestion]);

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

    useEffect(() => {
        if (!currentQuestion?.id || !isHost || questionsLoading) {
            return;
        }

        const initTimer = async () => {
            
            const status = await getTimerStatus();
            
            if (!status?.is_timer_running && !status?.timer_start_at) {
                const success = await startTimer(15);
                setIsTimerEnded(false);
            } else if (status?.is_timer_running) {
                setIsTimerEnded(false);
            } else {
                setIsTimerEnded(true);
            }
        };

        const timeout = setTimeout(initTimer, 100);
        return () => clearTimeout(timeout);
    }, [currentQuestion?.id, isHost, questionsLoading]);

    useEffect(() => {
        setSelectedAnswer(null);
        setIsTimerEnded(false);
        setAnswerTime(null);
        hasSubmittedRef.current = false;
        
        updatePlayerStatus("answering");
    }, [currentQuestion?.id]);

    const handleAnswerSelect = async (answer: string) => {
        if (isTimerEnded) return;
        
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
        if (!isTimerEnded || !user?.id || !currentQuestion) return;
        if (hasSubmittedRef.current) return;

        hasSubmittedRef.current = true;

        const submitAnswer = async () => {

            if (selectedAnswer) {
                const isCorrect = selectedAnswer === currentQuestion?.question_data?.back;
                const responseTime = answerTime || 15000;
                
                await updatePlayerStatus(isCorrect ? "correct" : "wrong");
                
                await submitResponse(
                    user.id,
                    currentQuestion.question_id,
                    selectedAnswer,
                    isCorrect,
                    responseTime
                );
                
                console.log("📝 Response submitted:", { answer: selectedAnswer, isCorrect, responseTime });
            } else {
                await updatePlayerStatus("wrong");
                
                await submitResponse(
                    user.id,
                    currentQuestion.question_id,
                    "",
                    false,
                    15000
                );
                
                console.log("📝 No answer submitted (marked wrong)");
            }
        };

        submitAnswer();
    }, [isTimerEnded, selectedAnswer, user?.id, currentQuestion?.id]);

    const handleNextQuestion = async () => {
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

    return (
        <div className="min-h-screen flex flex-col">
            <div className="fixed flex flex-col top-0 right-0 items-center justify-center">
                <img src="/dashboard/star.svg" className="w-20 mt-5 mx-5" />
                <h2 className="text-base text-white font-main">1000 XP</h2>
            </div>

            <div className="flex flex-col items-center space-y-5 w-full flex-1">

                <div className="flex flex-row items-center justify-center gap-5 mt-10">
                    <div className="flex flex-row justify-start gap-4 p-4 rounded-lg overflow-x-auto">
                        {profiles.map((profile) => (
                            <PlayerStatus
                                key={profile.id}
                                profile={profile}
                                presence={presence[profile.id]}
                                showResult={isTimerEnded}
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
                    >
                        <Question text={currentQuestion?.question_data?.front || "Loading..."} />
                    </div>

                    <div className="flex flex-col flex-1 justify-between gap-3 lg:gap-5">
                        {shuffledOptions.map((option, index) => {
                            const isSelected = selectedAnswer === option;
                            const isCorrectAnswer = option === currentQuestion?.question_data?.back;
                            
                            let buttonClass = "";
                            
                            if (isTimerEnded && isSelected) {
                                buttonClass = isCorrectAnswer 
                                    ? "bg-lime text-black border-lime" 
                                    : "bg-pink text-black border-pink";
                            } else if (isSelected) {
                                buttonClass = "bg-cyan text-black border-cyan";
                            }
                            
                            return (
                                <AnswerOption 
                                    key={index}
                                    text={option}
                                    onSelect={() => handleAnswerSelect(option)}
                                    disabled={isTimerEnded}
                                    className={buttonClass}
                                />
                            );
                        })}
                        
                        {isHost && isTimerEnded && (
                            <button
                                onClick={handleNextQuestion}
                                className="mt-5 p-4 bg-black text-white font-main rounded-2xl hover:scale-105 transition-transform"
                            >
                                Next Question
                            </button>
                        )}
                        
                        {!isHost && isTimerEnded && (
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