import React from "react";
import { HiMiniNewspaper } from "react-icons/hi2";
import { TiPlus } from "react-icons/ti";
import { FaClone } from "react-icons/fa";
import { HiEmojiHappy } from "react-icons/hi";
import { RiEmotionUnhappyFill } from "react-icons/ri";

interface SummaryReportProps {
  totalXpEarned: number;
  itemsCompleted: number;
  firstAttempts: number;
  reattempts: number;
  deckColor: string;
  onClose: () => void;
  onRetry?: () => void;
}

type ColorClasses = {
  border: string;
  bg: string;
  text: string;
  focusBorder: string;
  hover: string;
  hoverBorder: string;
};

const SummaryReport: React.FC<SummaryReportProps> = ({
  totalXpEarned,
  itemsCompleted,
  firstAttempts,
  reattempts,
  deckColor,
  onClose,
  onRetry,
}) => {
  // Calculate mastery rating: Only first attempts count towards mastery
  // If you got it right on first try = full mastery for that card
  const masteryRating = itemsCompleted > 0 
    ? ((firstAttempts / itemsCompleted) * 100).toFixed(1)
    : "0.0";

  const [displayedPercentage, setDisplayedPercentage] = React.useState(0);

  React.useEffect(() => {
    const targetPercentage = parseFloat(masteryRating);
    const duration = 1500; // 1.5 seconds
    const steps = 60;
    const increment = targetPercentage / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayedPercentage(targetPercentage);
        clearInterval(timer);
      } else {
        setDisplayedPercentage(increment * currentStep);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [masteryRating]);

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
  
  return (
    <div className="max-w-3xl mx-auto mt-8 px-4">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .modal-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>

      <div className="bg-black rounded-3xl w-full modal-fade-in overflow-hidden shadow-2xl">
        {/* Header */}
        <div className={`${colors.bg} px-4 sm:px-8 py-4 sm:py-6`}>
          <h2 className="text-2xl sm:text-3xl font-main text-white flex items-center gap-2 sm:gap-3">
            <HiMiniNewspaper className="text-white" size={28} />
            Summary Report
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-10">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Left: Mastery Rating Rectangle */}
            <div className={`${colors.bg} rounded-2xl p-8 sm:p-12 lg:p-15 flex-shrink-0 w-full lg:w-[280px]`}>
              <div className="text-center">
                <p className="text-white font-main text-base sm:text-lg mb-3 sm:mb-4">MASTERY RATING</p>
                <div className="text-4xl sm:text-5xl font-main text-white font-bold">{displayedPercentage.toFixed(1)}%</div>
              </div>
            </div>

            {/* Right: Stats */}
            <div className="pt-2 lg:pt-3 lg:ml-4 flex-1 space-y-4 sm:space-y-6">
              {/* XP Earned */}
              <div className="flex items-center justify-between">
                <span className="font-main text-base sm:text-xl text-white flex items-center gap-2 sm:gap-3">
                  <TiPlus size={20} className="sm:w-6 sm:h-6" />
                  XP EARNED
                </span>
                <span className={`font-main text-base sm:text-xl ${colors.text}`}>{totalXpEarned} XP</span>
              </div>

              {/* Items Completed */}
              <div className="flex items-center justify-between">
                <span className="font-main text-base sm:text-xl text-white flex items-center gap-2 sm:gap-3">
                  <FaClone size={18} className="sm:w-5 sm:h-5" />
                  ITEMS COMPLETED
                </span>
                <span className="font-main text-base sm:text-xl text-pink">{itemsCompleted} ITEMS</span>
              </div>

              {/* First Attempts */}
              <div className="flex items-center justify-between">
                <span className="font-main text-base sm:text-xl text-white flex items-center gap-2 sm:gap-3">
                  <HiEmojiHappy size={20} className="sm:w-6 sm:h-6" />
                  FIRST ATTEMPTS
                </span>
                <span className={`font-main text-base sm:text-xl ${colors.text}`}>{firstAttempts} ITEMS</span>
              </div>

              {/* Reattempts */}
              <div className="flex items-center justify-between">
                <span className="font-main text-base sm:text-xl text-white flex items-center gap-2 sm:gap-3">
                  <RiEmotionUnhappyFill size={20} className="sm:w-6 sm:h-6" />
                  REATTEMPTS
                </span>
                <span className={`font-main text-base sm:text-xl ${colors.text}`}>{reattempts} ITEMS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons INSIDE the container */}
        <div className="px-4 sm:px-8 pb-8 sm:pb-12 flex flex-col sm:flex-row gap-4 sm:gap-8">
          <button
            onClick={onClose}
            className={`cursor-pointer flex-1 py-3 text-white border-2 border-white rounded-full font-main text-base sm:text-lg transition-all duration-300 hover:bg-white hover:text-black`}
          >
            Exit Session
          </button>
          <button
            onClick={onRetry}
            className={`cursor-pointer flex-1 py-3 bg-white text-black border-2 border-white rounded-full font-main text-base sm:text-lg transition-all duration-300 ${colors.hover} ${colors.hoverBorder} hover:text-white`}
          >
            Retry Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default SummaryReport;