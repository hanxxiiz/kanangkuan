"use client";

import ChallengePlayersBar from '@/components/dashboard/games/ChallengePlayersBar'
import { useChallenges } from '@/lib/hooks/useChallenges';
import { useProfiles } from '@/lib/hooks/useProfile';
import { useRealtimeChallenge } from '@/lib/hooks/useRealtimeChallenge';
import { useUser } from '@/lib/hooks/useUser';
import React from 'react'

export default function ChallengePlay({ params }: {
  params: Promise<{ challengeId: string }>;
}) {
    const { challengeId } = React.use(params);
    const { challenge } = useChallenges(challengeId);
    const { user } = useUser();

    const {
        players,
        timer,
        showResults,
        sendStatus,
        submitAnswer,
        goToNextQuestion,
        finishGame
    } = useRealtimeChallenge({
        challengeId: challengeId,
        userId: user?.id!,
        isHost: user?.id === challenge?.host_id
    });

    const { profiles } = useProfiles({ userIds: Object.keys(players) });

    return (
        <div className="min-h-screen flex flex-col">
            <div className="fixed flex flex-col top-0 right-0 items-center justify-center">
                <img src="/dashboard/star.svg" className="w-20 mt-5 mx-5" />
                <h2 className="text-base text-white font-main">1000 XP</h2>
            </div>

            <div className="flex flex-col items-center space-y-5 w-full flex-1">

                <div className="flex flex-row items-center justify-center gap-5 mt-10">
                    <ChallengePlayersBar 
                        profiles={profiles}
                        players={players}
                        showResults={showResults}
                    />
                </div>

                <div className="flex flex-col lg:flex-row w-full h-full lg:px-20 p-5 mb-5 lg:mb-25 flex-1 lg:gap-10 gap-3">
                    <div className="w-full flex justify-center mb-3">
                        <div className="text-xl lg:text-2xl font-main text-black">
                            {timer}s
                        </div>
                    </div>

                    <div
                        className="flex-1 h-auto flex items-center justify-center rounded-3xl p-10 border border-black"
                    >
                        <p className="text-center font-main text-black text-md lg:text-xl max-w-md">
                            A playful collections of tools and features you can flip through with ease.
                            Each deck is designed to keep things simple, handy, and a little more fun,
                            so you can discover, learn, and do more without the boring stuff.
                        </p>
                    </div>

                    <div className="flex flex-col flex-1 justify-between gap-3 lg:gap-5">
                        <button
                            className="p-3 text-center border border-black rounded-3xl h-full font-body text-base lg:text-lg text-black"
                            onClick={() => {
                                sendStatus();
                                submitAnswer("A", true);
                            }}
                        >
                                Answer A
                        </button>
                        <button
                            className="p-3 text-center border border-black rounded-3xl h-full font-body text-base lg:text-lg text-black"
                            onClick={() => {
                                sendStatus();
                                submitAnswer("B", false);
                            }}
                        >
                                Answer B
                        </button>
                        <button
                            className="p-3 text-center border border-black rounded-3xl h-full font-body text-base lg:text-lg text-black"
                            onClick={() => {
                                sendStatus();
                                submitAnswer("C", false);
                            }}
                        >
                                Answer C
                        </button>
                        <button
                            className="p-3 text-center border border-black rounded-3xl h-full font-body text-base lg:text-lg text-black"
                            onClick={() => {
                                sendStatus();
                                submitAnswer("D", false);
                            }}
                        >
                                Answer D
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}