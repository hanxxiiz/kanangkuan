"use client";

import React from 'react';

interface BaitedModalProps {
  show: boolean;
  baiterName: string;
  xpLost: number;
}

export default function BetAndBaitResults({ show, baiterName, xpLost }: BaitedModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md mx-4 border-4 border-black pointer-events-auto">
        <div className="flex flex-col items-center text-center space-y-4">
          <h2 className="text-gray-500 font-main text-2xl">Bet and Bait</h2>
          <h1 className="text-black font-main text-6xl font-bold">Oops...</h1>
          
          <div className="w-full border-2 border-black rounded-2xl p-6 space-y-3">
            <p className="text-black font-main text-2xl">
              You got baited by <span className="font-bold">{baiterName}</span>!
            </p>
            <p className="text-black font-main text-xl">You lost</p>
            <p className="text-black font-main text-7xl font-bold">{xpLost} XP</p>
          </div>
        </div>
      </div>
    </div>
  );
}