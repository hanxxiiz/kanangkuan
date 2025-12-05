import React from "react";

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
    <div className="max-w-2xl mx-auto mt-8">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .modal-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>

      <div className="bg-white rounded-3xl w-full modal-fade-in border-3 border-black overflow-hidden">
        {/* Header */}
        <div className={`${colors.bg} px-8 py-6 border-b-3 border-black`}>
          <h2 className="text-3xl font-main text-white">Summary Report</h2>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="flex gap-8">
            {/* Left: Mastery Rating */}
            <div className={`${colors.bg} rounded-2xl p-8 border-3 border-black flex-shrink-0`} style={{width: '280px'}}>
              <div className="text-center">
                <p className="text-black font-main text-md mb-4">MASTERY RATING</p>
                <div className="text-6xl font-main text-black mb-2">{masteryRating}%</div>
              </div>
            </div>

            {/* Right: Stats */}
            <div className="flex-1 space-y-6">
              {/* XP Earned */}
              <div className="flex items-center justify-between">
                <span className="font-main text-xl text-black">XP EARNED</span>
                <span className="font-main text-2xl text-black">{totalXpEarned} XP</span>
              </div>

              {/* Items Completed */}
              <div className="flex items-center justify-between">
                <span className="font-main text-xl text-black">ITEMS COMPLETED</span>
                <span className="font-main text-2xl text-black">{itemsCompleted} items</span>
              </div>

              {/* First Attempts */}
              <div className="flex items-center justify-between">
                <span className="font-main text-xl text-black">FIRST ATTEMPTS</span>
                <span className="font-main text-2xl text-black">{firstAttempts} items</span>
              </div>

              {/* Reattempts */}
              <div className="flex items-center justify-between">
                <span className="font-main text-xl text-black">REATTEMPTS</span>
                <span className="font-main text-2xl text-black">{reattempts} items</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Buttons */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={onClose}
          className="flex-1 py-4 bg-white hover:bg-gray-100 text-black border-2 border-black rounded-full font-main text-lg transition-all duration-300"
        >
          Go Back
        </button>
        <button
          onClick={onRetry}
          className={`flex-1 py-4 bg-black text-white border-2 border-black rounded-full font-main text-lg transition-all duration-300 ${colors.hover}`}
        >
          Retry
        </button>
      </div>
    </div>
  );
};

export default SummaryReport;