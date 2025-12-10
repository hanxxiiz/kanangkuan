"use client";

import React from 'react';

type ResultType = 'baited' | 'baiter' | 'both' | 'correct' | 'wrong';

interface BetAndBaitResultsProps {
  show: boolean;
  type: ResultType;
  baiterName?: string;
  xpLost?: number;
  xpGained?: number;
  baitedCount?: number;
}

export default function BetAndBaitResults({
  show,
  type,
  baiterName = 'Someone',
  xpLost = 0,
  xpGained = 0,
  baitedCount = 0
}: BetAndBaitResultsProps) {
  if (!show) return null;

  // Shared wrapper
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md mx-4 border-2 border-black">
        <div className="flex flex-col items-center text-center space-y-4">{children}</div>
      </div>
    </div>
  );

  if (type === 'both') {
    const netXp = xpGained - xpLost;
    return (
      <Wrapper>
        <h2 className="text-gray-500 font-main text-2xl">Bet and Bait</h2>
        <h1 className="text-black font-main text-5xl font-bold">Mixed Results!</h1>
        <div className="w-full border-2 border-black rounded-2xl p-6 space-y-3">
          <p className="text-black font-main text-lg">
            You got baited by <span className="font-bold">{baiterName}</span> (-{xpLost} XP)
          </p>
          <p className="text-black font-main text-lg">
            But you baited <span className="font-bold">{baitedCount}</span> player{baitedCount !== 1 ? 's' : ''}! (+{xpGained} XP)
          </p>
          <p className="text-black font-main text-xl mt-4">Net:</p>
          <p className={`font-main text-6xl font-bold ${netXp >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {netXp >= 0 ? '+' : ''}{netXp} XP
          </p>
        </div>
      </Wrapper>
    );
  }

  if (type === 'baited') {
    return (
      <Wrapper>
        <h2 className="text-gray-500 font-main text-2xl">Bet and Bait</h2>
        <h1 className="text-black font-main text-6xl font-bold">Oops...</h1>
        <div className="w-full border-2 border-black rounded-2xl p-6 space-y-3">
          <p className="text-black font-main text-2xl">
            You got baited by <span className="font-bold">{baiterName}</span>!
          </p>
          <p className="text-black font-main text-xl">You lost</p>
          <p className="text-black font-main text-7xl font-bold">{xpLost} XP</p>
        </div>
      </Wrapper>
    );
  }

  if (type === 'baiter') {
    return (
      <Wrapper>
        <h2 className="text-gray-500 font-main text-2xl">Bet and Bait</h2>
        <h1 className="text-green-600 font-main text-6xl font-bold">Nice!</h1>
        <div className="w-full border-2 border-black rounded-2xl p-6 space-y-3">
          <p className="text-black font-main text-2xl">
            You baited <span className="font-bold">{baitedCount}</span> player{baitedCount !== 1 ? 's' : ''}!
          </p>
          <p className="text-black font-main text-xl">You gained</p>
          <p className="text-green-600 font-main text-7xl font-bold">+{xpGained} XP</p>
        </div>
      </Wrapper>
    );
  }

  if (type === 'correct') {
    return (
      <Wrapper>
        <h2 className="text-gray-500 font-main text-2xl">Round Result</h2>
        <h1 className="text-green-600 font-main text-6xl font-bold">Correct!</h1>
        <div className="w-full border-2 border-black rounded-2xl p-6 space-y-3">
          <p className="text-black font-main text-xl">Great job on that one.</p>
        </div>
      </Wrapper>
    );
  }

  if (type === 'wrong') {
    return (
      <Wrapper>
        <h2 className="text-gray-500 font-main text-2xl">Round Result</h2>
        <h1 className="text-red-500 font-main text-6xl font-bold">Wrong</h1>
        <div className="w-full border-2 border-black rounded-2xl p-6 space-y-3">
          <p className="text-black font-main text-xl">You can get the next one!</p>
        </div>
      </Wrapper>
    );
  }

  // type === 'baiter'
  return (
    <Wrapper>
      <h2 className="text-gray-500 font-main text-2xl">Bet and Bait</h2>
      <h1 className="text-green-600 font-main text-6xl font-bold">Nice!</h1>
      <div className="w-full border-2 border-black rounded-2xl p-6 space-y-3">
        <p className="text-black font-main text-2xl">
          You baited <span className="font-bold">{baitedCount}</span> player{baitedCount !== 1 ? 's' : ''}!
        </p>
        <p className="text-black font-main text-xl">You gained</p>
        <p className="text-green-600 font-main text-7xl font-bold">+{xpGained} XP</p>
      </div>
    </Wrapper>
  );
}