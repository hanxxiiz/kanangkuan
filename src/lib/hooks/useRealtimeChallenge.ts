"use client";

import { GameResults, PlayerGameState } from '@/types/challenge-gameplay';
import { createClient } from '@/utils/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react'
import { gameService } from '../services';
import { channel } from 'diagnostics_channel';

export function useRealtimeChallenge({
    challengeId,
    userId,
    isHost,
}: {
    challengeId: string;
    userId: string;
    isHost: boolean;
}) {
  const supabase = createClient();
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [players, setPlayers] = useState<Record<string, PlayerGameState>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [results, setResults] = useState<GameResults | null>(null);
  const [timer, setTimer] = useState(15);
  const [showResults, setShowResults] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<Date | null>(null);

  useEffect(() => {
    if (!userId || !challengeId) return;

    const channel = supabase.channel(`challenge-${challengeId}`, {
      config: { presence: { key: userId } },
    });

    setChannel(channel);

    const setup = async () => {

      //FOR PRESENCE OK???
      channel.on("presence", { event: "sync"}, () => {
        const state = channel.presenceState() as Record<string, PlayerGameState[]>;

        const formatted: Record<string, PlayerGameState> = {};

        for (const key in state) {
          const entry = state[key][0];
          formatted[entry.user_id] = entry;
        }

        setPlayers(formatted);
      });

      //BROADCAST TO SEE WHO IS STILL ANSWERING OK???
      channel.on("broadcast", { event: "player-answering"}, ({payload}) => {
        setPlayers((prev) => ({
          ...prev,
          [payload.user_id]: {
            ...prev[payload.user_id],
            status: "answering"
          },
        }));
      });

      //BROADCAST TO SEE WHO IS WRONG OR RYT??? VAMFYR RYT???
      channel.on("broadcast", { event: "answer-submitted"}, ({ payload }) => {
        setPlayers((prev) => ({
          ...prev,
          [payload.user_id]: {
            ...prev[payload.user_id],
            status: "done",
            answer: payload.answer,
            correct: payload.correct,
          },
        }));
      });

      //BROADCAST TO RESTART TIMER FOR THE NEXT QUESTION
      channel.on("broadcast", { event: "question-next" }, ({ payload }) => {
        setCurrentQuestionIndex(payload.index);
        setQuestionStartTime(new Date(payload.startTime));
        setShowResults(false);
      });

      //BROADCAST TO SEE THE FINAL RESULTS OF THE CHALLENGE OK???
      channel.on("broadcast", { event: "game-finished" }, ({ payload }) => {
        setResults(payload.results);
      });

      await channel.subscribe();

      await channel.track({
        user_id: userId,
        status: "answering",
      });

      const { data } = await supabase
        .from('challenge_state')
        .select('question_start_time')
        .eq('challenge_id', challengeId)
        .single();

      if (!data) {
        const now = new Date();
        await supabase
          .from('challenge_state')
          .insert({
            challenge_id: challengeId,
            question_start_time: now
          });
        
          setQuestionStartTime(now);
      } else {
        setQuestionStartTime(new Date(data.question_start_time));
      }
    };

    setup();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, challengeId]);

  useEffect(() => {
    if (!questionStartTime || !channel) return;

    let interval: NodeJS.Timeout;

    const tick = () => {
      const secondsPassed = Math.floor((Date.now() - questionStartTime.getTime()) / 1000);
      const remaining = Math.max(0, 15 - secondsPassed);
      setTimer(remaining);
      if (remaining <= 0) setShowResults(true);
    };

    if (isHost) {
      interval = setInterval(() => {
        tick();
        channel.send({
          type: "broadcast",
          event: "timer-update",
          payload: { startTime: questionStartTime.getTime() },
        });
      }, 1000);
    } else {
      interval = setInterval(tick, 500);
    }

    channel.on("broadcast", { event: "timer-update" }, ({ payload }) => {
      const newStart = new Date(payload.startTime);
      if (Math.abs(newStart.getTime() - (questionStartTime?.getTime() ?? 0)) > 500) {
        setQuestionStartTime(newStart);
        setShowResults(false);
      }
    });

    return () => clearInterval(interval);
  }, [questionStartTime, channel, isHost]);

  //TO UPDATE THE STATUS OF EACH USER IN THE BROADCAST OK????
  const sendStatus = useCallback(async () => {
    if (!channel) return;
    await channel.send({
      type: "broadcast",
      event: "player-answering",
      payload: { user_id: userId },
    });
  }, [channel, userId]);

  //TO UPDATE THE BROADCAST THAT CHECKS WHO IS WRONG OR RYT VAMFYR RYT???
  const submitAnswer = useCallback(
    async (answer: string, correct: boolean) => {
      if (!channel) return;

      setPlayers((prev) => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          status: "done",
          answer,
          correct,
        },
      }));

      await channel.send({
        type: "broadcast",
        event: "answer-submitted",
        payload: {
          user_id: userId,
          answer,
          correct,
        },
      });
    },
    [channel, userId]
  );

  //TO PROCEED TO THE NEXT QUESTION OK???
  const goToNextQuestion = useCallback(
    async () => {
      if (!channel) return;

      const startTime = Date.now();
      setQuestionStartTime(new Date(startTime));
      
      await supabase
        .from('challenge_state')
        .update({ question_start_time: new Date(startTime) })
        .eq('challenge_id', challengeId);

      await channel.send({
        type: "broadcast",
        event: "question-next",
        payload: { 
          index: currentQuestionIndex + 1,
          startTime,
        },
      });
    },
    [channel, currentQuestionIndex]
  );

  //TO SHOW FINAL RESULTS OK????
  const finishGame = useCallback(
    async (results: GameResults) => {
      if (!channel) return;

      await gameService.updateGameStatus("challenge", "finished", challengeId);

      await channel.send({
        type: "broadcast",
        event: "game-finished",
        payload: { results },
      });
    },
    [channel, challengeId]
  );

  return {
    players,
    currentQuestionIndex,
    timer,
    results,
    showResults,
    sendStatus,
    submitAnswer,
    goToNextQuestion,
    finishGame,
  }
}
