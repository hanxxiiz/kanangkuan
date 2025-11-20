"use client";
import React, { useState } from "react";
import { LuBot } from "react-icons/lu";
import { Card } from "@/lib/queries/basic-review-queries";

interface FlashcardProps {
  card: Card;
  onExplainClick: () => Promise<void>;
  hasKeys: boolean; 
}

export default function Flashcard({ card, onExplainClick, hasKeys }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);

  const handleExplainClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); 
    if (!flipped) {
      await onExplainClick(); 
    }
  };

  return (
    <div 
      className="w-[800px] h-[400px] md:w-[900px] md:h-[460px] 3xl:w-[1000px] 3xl:h-[550px] cursor-pointer"
      onClick={() => setFlipped(!flipped)}
      style={{ perspective: "1000px" }}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{ 
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateX(180deg)" : "rotateX(0deg)"
        }}
      >
        {/* Front of card */}
        <div
          className="absolute w-full h-full bg-[#101220] rounded-2xl shadow-lg flex items-center justify-center"
          style={{ backfaceVisibility: "hidden" }}
        >
          <button
            onClick={handleExplainClick}
            className={`absolute top-5 right-5 flex items-center gap-2 px-5 py-2 border-1 border-white text-white rounded-full hover:bg-white hover:text-[#101220] transition-all duration-300 font-main text-md z-10 ${
              flipped ? "pointer-events-none opacity-0" : "cursor-pointer"
            }`}
          >
            <LuBot className="text-xl" />
            <span>Explain</span>
          </button>

          <span className="text-white font-main text-2xl px-8 text-center">
            {card.front}
          </span>
        </div>

        {/* Back of card */}
        <div
          className="absolute w-full h-full bg-[#101220] rounded-2xl shadow-lg flex items-center justify-center"
          style={{ 
            backfaceVisibility: "hidden",
            transform: "rotateX(180deg)"
          }}
        >
          <span className="text-center text-white font-regular text-2xl px-8">
            {card.back}
          </span>
        </div>
      </div>
    </div>
  );
}