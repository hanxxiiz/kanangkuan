"use client";
import React, { useState } from "react";
import { Card } from "@/lib/queries/basic-review-queries";

interface FlashcardProps {
  card: Card;
}

export default function Flashcard({ card }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);

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
          className="absolute w-full h-full bg-black rounded-2xl shadow-lg flex items-center justify-center"
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="text-white font-main text-2xl px-8 text-center">
            {card.front}
          </span>
        </div>

        {/* Back of card */}
        <div
          className="absolute w-full h-full bg-black rounded-2xl shadow-lg flex items-center justify-center"
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