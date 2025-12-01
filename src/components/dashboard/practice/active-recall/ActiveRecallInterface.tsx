import React, { useState, useEffect, useRef } from "react";
import { FaRegLightbulb, FaHeart } from "react-icons/fa";
import { FaLightbulb, FaArrowUp } from "react-icons/fa6";
import { LuBookOpen } from "react-icons/lu";
import { ActiveRecallCard } from "@/lib/queries/active-recall-queries";

interface ActiveRecallInterfaceProps {
  card: ActiveRecallCard;
  hintsLeft: number;
  livesLeft: number;
  deckColor: string;
  onCorrectAnswer: (xp: number) => void;
  onWrongAnswer: () => void;
  onUseHint: () => boolean;
  onReveal: () => void;
  isRevealed: boolean;
  isCorrect: boolean;
  shouldShake: boolean;
  shouldAnimate: boolean;
}

type ColorClasses = {
  border: string;
  bg: string;
  text: string;
  focusBorder: string;
  hover: string;
  hoverBorder: string;
};

const ActiveRecallInterface: React.FC<ActiveRecallInterfaceProps> = ({
  card,
  hintsLeft,
  livesLeft,
  deckColor,
  onCorrectAnswer,
  onWrongAnswer,
  onUseHint,
  onReveal,
  isRevealed,
  isCorrect,
  shouldShake,
  shouldAnimate,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [displayXP, setDisplayXP] = useState(0);
  const [targetXP, setTargetXP] = useState(0);
  const [cardKey, setCardKey] = useState(0);

  // Timer state for calculating XP based on speed
  const startTimeRef = useRef<number | null>(null);

  const isInputActive = isFocused || inputValue.length > 0;

  // Reset states when card changes (card prop change implies a new card is shown)
  useEffect(() => {
    setInputValue("");
    setIsFocused(false);
    setHintsUsed(0);
    setCardKey(prev => prev + 1);
    startTimeRef.current = Date.now();
  }, [card]);

  // Animate XP counter
  useEffect(() => {
    if (displayXP === targetXP) return;

    const difference = Math.abs(targetXP - displayXP);
    const increment = targetXP > displayXP ? Math.ceil(difference / 20) : -Math.ceil(difference / 20);
    const duration = 20;

    const timer = setTimeout(() => {
      setDisplayXP(prev => {
        const next = prev + increment;
        if (increment > 0) {
          return next > targetXP ? targetXP : next;
        } else {
          return next < targetXP ? targetXP : next;
        }
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [displayXP, targetXP]);

  // Helper function to get Tailwind color classes based on deckColor
  const getColorClasses = () => {
    const colorMap: { [key: string]: ColorClasses } = {
      cyan: {
        border: 'border-cyan',
        bg: 'bg-cyan',
        text: 'text-cyan',
        focusBorder: 'focus:border-cyan',
        hover: 'hover:!bg-cyan',
        hoverBorder: 'hover:!border-cyan',
      },
      pink: {
        border: 'border-pink',
        bg: 'bg-pink',
        text: 'text-pink',
        focusBorder: 'focus:border-pink',
        hover: 'hover:!bg-pink',
        hoverBorder: 'hover:!border-pink',
      },
      lime: {
        border: 'border-lime',
        bg: 'bg-lime',
        text: 'text-lime',
        focusBorder: 'focus:border-lime',
        hover: 'hover:!bg-lime',
        hoverBorder: 'hover:!border-lime',
      },
      purple: {
        border: 'border-purple',
        bg: 'bg-purple',
        text: 'text-purple',
        focusBorder: 'focus:border-purple',
        hover: 'hover:!bg-purple',
        hoverBorder: 'hover:!border-purple',
      },
      blue: {
        border: 'border-blue',
        bg: 'bg-blue',
        text: 'text-blue',
        focusBorder: 'focus:border-blue',
        hover: 'hover:!bg-blue',
        hoverBorder: 'hover:!border-blue',
      },
    };
    return colorMap[deckColor] || colorMap.lime;
  };

  const colors = getColorClasses();

  // Handle user submitting an answer
  const handleSubmit = () => {
    if (!inputValue.trim()) return;

    const userAnswer = inputValue.toLowerCase().trim();
    const correctAnswer = card.blank_word ? card.blank_word.toLowerCase().trim() : card.back.toLowerCase().trim();

    if (userAnswer === correctAnswer) {
      const endTime = Date.now();
      const timeTaken = startTimeRef.current ? (endTime - startTimeRef.current) / 1000 : 999;
      // Award more XP for faster answers
      const xpAwarded = timeTaken <= 10 ? 100 : 50;

      onCorrectAnswer(xpAwarded);

      // Start XP animation
      setTimeout(() => {
        setTargetXP(prev => prev + xpAwarded);
      }, 100);
    } else {
      setInputValue("");
      onWrongAnswer();
    }
  };

  // Handle hint button click
  const handleHintClick = (): void => {
    if (onUseHint()) {
      setHintsUsed(prev => prev + 1);
    }
  };

  // Function to render the back text, hiding the blank word or revealing it based on state
  const renderBackWithBlank = () => {
    if (!card.blank_word) {
      return <span className="text-black">{card.back}</span>;
    }

    const backText = card.back;
    const blankWord = card.blank_word;
    const lowerBackText = backText.toLowerCase();
    const lowerBlankWord = blankWord.toLowerCase();

    const index = lowerBackText.indexOf(lowerBlankWord);

    if (index === -1) {
      return <span className="text-black">{card.back}</span>;
    }

    const before = backText.substring(0, index);
    const word = backText.substring(index, index + blankWord.length);
    const after = backText.substring(index + blankWord.length);

    // Helper function to convert word to underscores with progressive reveal
    const toUnderscoresWithReveal = (text: string, revealCount: number) => {
      return text.split('').map((char, idx) => {
        if (char === ' ') return ' ';
        // Reveal characters up to revealCount
        if (idx < revealCount) return char;
        return '_';
      }).join('');
    };

    return (
      <span className="text-black">
        {before}
        {isCorrect || isRevealed ? (
          // Fully revealed/correct state
          <span className={`${colors.bg} text-black font-semibold decoration-2 underline-offset-2 px-1 rounded`}>
            {word}
          </span>
        ) : hintsUsed > 0 ? (
          // Partially revealed state (using hints)
          <span className={`${colors.bg} text-black font-mono tracking-wider px-1 rounded whitespace-pre`}>
            {toUnderscoresWithReveal(word, hintsUsed)}
          </span>
        ) : (
          // Hidden state (initial)
          <span className={`${colors.bg} text-black font-mono tracking-wider px-1 rounded whitespace-pre`}>
            {toUnderscoresWithReveal(word, 0)}
          </span>
        )}
        {after}
      </span>
    );
  };

  return (
    <div className="w-full">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
          20%, 40%, 60%, 80% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slideUp 0.4s ease-out forwards;
        }
        .card-container {
          opacity: 0; /* Start hidden */
        }
        .card-container.animate-slide-up {
          opacity: 1; /* Will be animated by the animation */
        }
        .card-container:not(.animate-slide-up) {
          opacity: 1; /* Show immediately if not animating */
        }
      `}</style>

      {/* Stats Row */}
      <div className="flex justify-between items-center text-black mb-2">
        <div className="text-lg font-main">
          +{displayXP}XP
        </div>

        <div className="flex items-center gap-6 px-5 py-1.5 bg-black rounded-full">
          {/* Hints Left */}
          <div className="flex items-center gap-2">
            <FaLightbulb className="text-white text-xl" />
            <span className="text-white font-main text-lg">{hintsLeft}</span>
          </div>

          {/* Lives Left */}
          <div className="flex items-center gap-2">
            <FaHeart className="text-white text-xl" />
            <span className="text-white font-main text-lg">{livesLeft}</span>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div key={cardKey} className={`card-container ${shouldAnimate ? "animate-slide-up" : ""}`}>
        <div className={`bg-white border-3 ${colors.border} rounded-3xl overflow-hidden mb-10 transition-transform ${
          shouldShake ? 'animate-shake' : ''
        }`}>
          {/* Question Section - Upper Half */}
          <div className="p-5 py-4">
            <h2 className="text-xl font-main text-black">
              {card.front}
            </h2>
          </div>

          {/* Dashed Divider */}
          <div className="border-t-2 border-dashed border-gray-200"></div>

          {/* Answer Section - Lower Half */}
          <div className="p-5">
            <div className="flex items-center gap-2 text-lg font-regular">
              {renderBackWithBlank()}
            </div>
          </div>
        </div>

        {/* Input Field with Send Button */}
        <div className="relative mb-6">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Type answer"
            disabled={isCorrect || isRevealed}
            className={`font-regular w-full px-5 py-3 pr-14 border-2 border-gray-300 rounded-full text-lg text-black placeholder-gray-300 focus:outline-none ${colors.focusBorder} peer transition-colors duration-300 disabled:bg-gray-100 disabled:cursor-not-allowed`}
          />
          <button
            disabled={!isInputActive || isCorrect || isRevealed}
            onClick={handleSubmit}
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-300 ${
              isInputActive && !isCorrect && !isRevealed && isFocused
                ? `cursor-pointer ${colors.bg} hover:!bg-black`
                : 'cursor-not-allowed bg-gray-200'
            }`}
          >
            <FaArrowUp className="text-lg text-white" />
          </button>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          {/* Hint Button */}
          <button
            onClick={handleHintClick}
            disabled={isCorrect || isRevealed}
            className={`flex-1 py-2 border-2 rounded-full font-main text-lg transition-all duration-500 flex items-center justify-center gap-2 ${
              !isCorrect && !isRevealed
                ? 'cursor-pointer border-black text-black hover:bg-black hover:text-white'
                : 'cursor-not-allowed border-gray-400 text-gray-400'
            }`}
          >
            <FaRegLightbulb className="text-xl"/>
            Hint
          </button>

          {/* Reveal Button */}
          <button
            onClick={onReveal}
            disabled={isRevealed || isCorrect}
            className={`flex-1 py-2 border-2 rounded-full font-main text-lg transition-all duration-500 flex items-center justify-center gap-2 ${
              !isRevealed && !isCorrect
                ? `cursor-pointer border-black bg-black text-white ${colors.hover} ${colors.hoverBorder}`
                : 'cursor-not-allowed border-gray-400 bg-gray-400 text-gray-200'
            }`}
          >
            <LuBookOpen className="text-xl"/>
            Reveal
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActiveRecallInterface;