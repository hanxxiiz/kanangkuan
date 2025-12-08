"use client"

import HeroCard from "@/components/dashboard/practice/audio-player/HeroCard";
import TextCard from "@/components/dashboard/practice/audio-player/TextCard";
import { PracticeDataContext } from "@/components/dashboard/practice/PracticeLayout";
import { useState, useContext } from "react";
import { CgPlayButtonO, CgPlayPauseO, CgPlayTrackPrev, CgPlayTrackNext } from "react-icons/cg";

type Card = {
  id: string;
  deck_id: string;
  front: string;
  back: string;
};

const AudioPlayer = () => {
  const practiceData = useContext(PracticeDataContext);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // Get cards and deck color from context
  const cards = (practiceData?.cards || []) as Card[];
  const deckColor = practiceData?.deckColor || "lime";

  // Handle empty cards case
  if (cards.length === 0) {
    return (
      <div className="bg-black w-full h-full flex items-center justify-center">
        <p className="text-white text-xl">No cards available</p>
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrev = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  return (
    <div className="bg-black w-full h-full flex flex-col items-center overflow-hidden pt-15 lg:pt-2 px-4 gap-3">
      {/* Hero Card */}
      <HeroCard deckColor={`var(--color-${deckColor})`} />

      {/* Text Card */}
      <TextCard 
        question={currentCard.front}
        answer={currentCard.back}
        deckColor={`var(--color-${deckColor})`}
        isAlternate={currentCardIndex % 2 === 1}
        cardIndex={currentCardIndex}
      />

      {/* Controls */}
      <div className="flex items-center justify-center gap-8">
        {/* Previous Button */}
        <button
          onClick={handlePrev}
          disabled={currentCardIndex === 0}
          className="cursor-pointer text-white transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            ['--hover-color' as any]: `var(--color-${deckColor})`
          }}
          onMouseEnter={(e) => {
            if (currentCardIndex > 0) {
              e.currentTarget.style.color = `var(--color-${deckColor})`;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'white';
          }}
        >
          <CgPlayTrackPrev size={60} />
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={handlePlayPause}
          className="cursor-pointer text-white transition-colors duration-300"
          onMouseEnter={(e) => {
            e.currentTarget.style.color = `var(--color-${deckColor})`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'white';
          }}
        >
          {isPlaying ? (
            <CgPlayPauseO size={65} />
          ) : (
            <CgPlayButtonO size={65} />
          )}
        </button>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={currentCardIndex === cards.length - 1}
          className="cursor-pointer text-white transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          onMouseEnter={(e) => {
            if (currentCardIndex < cards.length - 1) {
              e.currentTarget.style.color = `var(--color-${deckColor})`;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'white';
          }}
        >
          <CgPlayTrackNext size={60} />
        </button>
      </div>
    </div>
  );
}

export default AudioPlayer;