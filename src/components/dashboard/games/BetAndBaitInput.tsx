"use client";

import React, { useEffect, useState, useRef } from 'react'

interface BetAndBaitInputProps {
  show: boolean;
  timer: number;
  question: string;
  onSubmit: (fakeAnswer: string) => void;
  isTimerEnded: boolean;
}

export default function BetAndBaitInput({ 
  show, 
  timer, 
  question, 
  onSubmit,
  isTimerEnded 
}: BetAndBaitInputProps) {
  const [fakeAnswer, setFakeAnswer] = useState("");
  const hasSubmittedRef = useRef(false);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    // Reset when modal opens
    if (show) {
      setFakeAnswer("");
      hasSubmittedRef.current = false;
      isSubmittingRef.current = false;
    }
  }, [show]);

  useEffect(() => {
    // Only submit once when timer ends
    if (isTimerEnded && !hasSubmittedRef.current && !isSubmittingRef.current) {
      hasSubmittedRef.current = true;
      isSubmittingRef.current = true;
      
      console.log("⏰ Timer ended, auto-submitting fake answer:", fakeAnswer || "kanang kuan");
      onSubmit(fakeAnswer || "kanang kuan");
    }
  }, [isTimerEnded, fakeAnswer, onSubmit]);

  const handleManualSubmit = () => {
    if (hasSubmittedRef.current || isSubmittingRef.current) {
      console.log("⚠️ Already submitted, ignoring manual submit");
      return;
    }
    
    hasSubmittedRef.current = true;
    isSubmittingRef.current = true;
    
    console.log("✅ Manual submit:", fakeAnswer || "kanang kuan");
    onSubmit(fakeAnswer || "kanang kuan");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-xs pointer-events-none" />
      <div
        className="relative bg-white rounded-lg shadow-xl p-8 w-full max-w-xl mx-4 z-10"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col justify-center items-center px-10 pt-5 pb-15">
          {/* XP Badge */}
          <div className="fixed flex flex-col top-0 right-0 items-center justify-center">
            <img src="/dashboard/star.svg" className="w-20 mt-5 mx-5" alt="star" />
            <h2 className="text-base text-white font-main">20 XP</h2>
          </div>

          {/* Heading */}
          <h3 className="text-3xl text-pink font-main">Betting Time!</h3>
          <h2 className="text-5xl text-black font-main">Bet & Bait</h2>

          {/* Content Box */}
          <div className="flex-1 flex-col flex items-center justify-center w-full border-1 rounded-2xl m-6 p-5 overflow-auto relative">
            {/* Timer */}
            <div className="absolute bottom-8 text-5xl text-lime font-main">
              {formatTime(timer)}
            </div>

            {/* Question and Input */}
            <div className="flex flex-col items-start justify-center w-full">
              <div className="font-main text-2xl text-center mb-3 w-full">
                {question}
              </div>
              <input 
                value={fakeAnswer}
                onChange={(e) => setFakeAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isTimerEnded && !hasSubmittedRef.current) {
                    handleManualSubmit();
                  }
                }}
                placeholder="20xp at stake"
                className="w-full outline-none border-b-1 placeholder:text-center py-1 text-4xl font-main text-center"
                disabled={isTimerEnded || hasSubmittedRef.current}
                autoFocus
              />
              <div className="text-left font-italic text-xs text-purple mt-1">
                {hasSubmittedRef.current ? "Submitted! Waiting for others..." : "Enter fake answer (press Enter to submit early)"}
              </div>
            </div>

            {/* Optional: Submit button for manual submission */}
            {!hasSubmittedRef.current && !isTimerEnded && (
              <button
                onClick={handleManualSubmit}
                className="mt-4 px-6 py-2 bg-purple text-white font-main rounded-lg hover:opacity-90 transition-opacity"
              >
                Submit Early
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}