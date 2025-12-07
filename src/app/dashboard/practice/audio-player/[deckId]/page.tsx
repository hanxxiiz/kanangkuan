"use client"

import HeroCard from "@/components/dashboard/practice/audio-player/HeroCard";
import TextCard from "@/components/dashboard/practice/audio-player/TextCard";
import { useState } from "react";
import { CgPlayButtonO, CgPlayPauseO, CgPlayTrackPrev, CgPlayTrackNext } from "react-icons/cg";

const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // Sample data - replace with actual data
  const deckColor = "#FF69B4"; // Hot pink color from the image
  const cards = [
    {
      question: "What is an apple?",
      answer: "the round fruit of a tree of the rose family, which typically has thin red or green skin and crisp flesh. Many varieties have been developed as dessert or cooking fruit or for making cider."
    }
  ];

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
    <div className="bg-black w-full h-full flex flex-col items-center justify-center overflow-hidden px-4 gap-8">
      {/* Hero Card */}
      <HeroCard deckColor={deckColor} />

      {/* Text Card */}
      <TextCard 
        question={currentCard.question}
        answer={currentCard.answer}
        deckColor={deckColor}
      />

      {/* Controls */}
      <div className="flex items-center justify-center gap-8 mt-4">
        {/* Previous Button */}
        <button
          onClick={handlePrev}
          disabled={currentCardIndex === 0}
          className="text-white hover:text-gray-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <CgPlayTrackPrev size={48} />
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={handlePlayPause}
          className="text-white hover:text-gray-300 transition-colors"
        >
          {isPlaying ? (
            <CgPlayPauseO size={64} />
          ) : (
            <CgPlayButtonO size={64} />
          )}
        </button>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={currentCardIndex === cards.length - 1}
          className="text-white hover:text-gray-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <CgPlayTrackNext size={48} />
        </button>
      </div>
    </div>
  );
}

export default AudioPlayer;