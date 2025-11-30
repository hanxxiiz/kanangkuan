import React from "react";
import { FaTrophy, FaFire, FaStar } from "react-icons/fa";

interface SummaryReportProps {
  totalXpEarned: number;
  itemsCompleted: number;
  firstAttempts: number;
  reattempts: number;
  deckColor: string;
  onClose: () => void;
}

const SummaryReport: React.FC<SummaryReportProps> = ({
  totalXpEarned,
  itemsCompleted,
  firstAttempts,
  reattempts,
  deckColor,
  onClose,
}) => {
  // Calculate mastery rating
  const masteryRating = ((firstAttempts + 0.5 * reattempts) / itemsCompleted * 100).toFixed(1);

  // Helper function to get Tailwind color classes
  const getColorClasses = () => {
    const colorMap: { [key: string]: any } = {
      cyan: {
        bg: 'bg-cyan',
        text: 'text-cyan',
      },
      pink: {
        bg: 'bg-pink',
        text: 'text-pink',
      },
      lime: {
        bg: 'bg-lime',
        text: 'text-lime',
      },
      purple: {
        bg: 'bg-purple',
        text: 'text-purple',
      },
      blue: {
        bg: 'bg-blue',
        text: 'text-blue',
      },
    };
    return colorMap[deckColor] || colorMap.lime;
  };

  const colors = getColorClasses();

  // Determine grade based on mastery rating
  const getGrade = () => {
    const rating = parseFloat(masteryRating);
    if (rating >= 90) return { letter: 'S', label: 'Perfect!' };
    if (rating >= 80) return { letter: 'A', label: 'Excellent!' };
    if (rating >= 70) return { letter: 'B', label: 'Great!' };
    if (rating >= 60) return { letter: 'C', label: 'Good!' };
    return { letter: 'D', label: 'Keep Practicing!' };
  };

  const grade = getGrade();

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .modal-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>

      <div className="bg-white rounded-3xl p-8 max-w-md w-full modal-fade-in border-3 border-black">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-20 h-20 ${colors.bg} rounded-full mb-4`}>
            <FaTrophy className="text-4xl text-black" />
          </div>
          <h2 className="text-3xl font-main text-black mb-2">Session Complete!</h2>
          <p className="text-gray-600 font-regular">Here's how you did</p>
        </div>

        {/* Mastery Rating - Highlighted */}
        <div className={`${colors.bg} rounded-2xl p-6 mb-6 border-2 border-black`}>
          <div className="text-center">
            <p className="text-black font-main text-sm mb-2">MASTERY RATING</p>
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-5xl font-main text-black">{masteryRating}%</span>
              <div className="flex flex-col items-start">
                <span className="text-3xl font-main text-black leading-none">{grade.letter}</span>
                <span className="text-sm font-regular text-black/80">{grade.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="space-y-4 mb-8">
          {/* Total XP */}
          <div className="flex items-center justify-between py-3 border-b-2 border-gray-200">
            <div className="flex items-center gap-3">
              <FaStar className={`text-2xl ${colors.text}`} />
              <span className="font-main text-lg text-black">Total XP Earned</span>
            </div>
            <span className="font-main text-2xl text-black">+{totalXpEarned}</span>
          </div>

          {/* Items Completed */}
          <div className="flex items-center justify-between py-3 border-b-2 border-gray-200">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full ${colors.bg} flex items-center justify-center`}>
                <span className="text-black font-main text-sm">✓</span>
              </div>
              <span className="font-main text-lg text-black">Items Completed</span>
            </div>
            <span className="font-main text-2xl text-black">{itemsCompleted}</span>
          </div>

          {/* First Attempts */}
          <div className="flex items-center justify-between py-3 border-b-2 border-gray-200">
            <div className="flex items-center gap-3">
              <FaFire className="text-2xl text-orange-500" />
              <span className="font-main text-lg text-black">First Attempts</span>
            </div>
            <span className="font-main text-2xl text-black">{firstAttempts}</span>
          </div>

          {/* Reattempts */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-black font-main text-sm">↻</span>
              </div>
              <span className="font-main text-lg text-black">Reattempts</span>
            </div>
            <span className="font-main text-2xl text-black">{reattempts}</span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`w-full py-4 ${colors.bg} hover:bg-black text-black hover:text-white border-2 border-black rounded-full font-main text-lg transition-all duration-300`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default SummaryReport;