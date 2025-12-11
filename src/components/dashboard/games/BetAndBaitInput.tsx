"use client";

import Image from 'next/image';
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
  const hasMountedRef = useRef(false);
  const initialTimerEndedRef = useRef(isTimerEnded);

  useEffect(() => {
    // Reset when modal opens
    if (show) {
      setFakeAnswer("");
      hasSubmittedRef.current = false;
      isSubmittingRef.current = false;
      hasMountedRef.current = false;
      initialTimerEndedRef.current = isTimerEnded;
      
      // Mark as mounted after a short delay to allow proper initialization
      const timeout = setTimeout(() => {
        hasMountedRef.current = true;
        console.log("🎲 BetAndBaitInput ready for submissions");
      }, 100);
      
      return () => clearTimeout(timeout);
    }
  }, [show, isTimerEnded]);

  useEffect(() => {
    // ✅ CRITICAL: Don't auto-submit on mount if timer was already ended
    // Only submit when timer TRANSITIONS to ended state AFTER mount
    if (!hasMountedRef.current) {
      console.log("⏸️ Ignoring timer state - component not ready yet");
      return;
    }
    
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
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
  <div className="absolute inset-0 bg-black/75 backdrop-blur-xs pointer-events-none" />
  <div
    className="relative bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-xl z-10"
    role="dialog"
    aria-modal="true"
  >
    <div className="flex flex-col justify-center items-center px-4 sm:px-8 lg:px-10 pt-4 sm:pt-5 pb-8 sm:pb-12 lg:pb-15">
      {/* XP Badge */}
      <div className="absolute flex flex-col top-0 right-0 items-center justify-center">
        <Image
          src="/dashboard/star.svg" 
          className="w-12 sm:w-16 lg:w-20 mt-3 sm:mt-4 lg:mt-5 mx-3 sm:mx-4 lg:mx-5" 
          alt="star" 
          width={100}
          height={100}
          sizes='100vw'
        />
        <h2 className="text-xs sm:text-sm lg:text-base text-white font-main">20 XP</h2>
      </div>

      {/* Heading */}
      <h3 className="text-xl sm:text-2xl lg:text-3xl text-pink font-main">Betting Time!</h3>
      <h2 className="text-3xl sm:text-4xl lg:text-5xl text-black font-main">Bet & Bait</h2>

      {/* Content Box */}
      <div className="flex-1 flex-col flex items-center justify-center w-full border-1 rounded-xl sm:rounded-2xl m-4 sm:m-6 p-4 sm:p-5 overflow-auto relative min-h-[250px] sm:min-h-[300px]">
        {/* Timer */}
        <div className="absolute top-4 sm:top-6 lg:top-8 text-3xl sm:text-4xl lg:text-5xl text-lime font-main">
          {formatTime(timer)}
        </div>

        {/* Question and Input */}
        <div className="flex flex-col items-start justify-center w-full">
          <div className="font-main text-lg sm:text-xl lg:text-2xl text-center mb-3 w-full">
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
            className="w-full outline-none border-b-1 placeholder:text-center py-1 text-2xl sm:text-3xl lg:text-4xl font-main text-center"
            disabled={isTimerEnded || hasSubmittedRef.current}
            autoFocus
          />
          <div className="text-left font-italic text-xs sm:text-sm text-purple mt-1">
            {hasSubmittedRef.current ? "Submitted! Waiting for others..." : "Enter fake answer (press Enter to submit early)"}
          </div>
        </div>

        {/* Submit button */}
        {!hasSubmittedRef.current && !isTimerEnded && (
          <button
            onClick={handleManualSubmit}
            className="mt-4 px-4 sm:px-6 py-2 sm:py-2.5 bg-purple text-white font-main text-sm sm:text-base rounded-lg hover:opacity-90 active:scale-95 transition-all"
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