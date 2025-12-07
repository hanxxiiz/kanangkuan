import React from "react";

interface ProgressBarProps {
  current: number;
  total: number;
  deckColor: string; 
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, deckColor }) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  // Map color strings to Tailwind classes
  const getColorClass = () => {
    const colorMap: { [key: string]: string } = {
      cyan: 'bg-cyan',
      pink: 'bg-pink',
      lime: 'bg-lime',
      purple: 'bg-purple',
      blue: 'bg-blue',
    };
    
    return colorMap[deckColor] || 'bg-lime'; // Default to lime
  };

  return (
    <div className="w-full mb-8">
      {/* Progress Bar */}
      <div className="w-full h-9 bg-gray-200 rounded-full overflow-hidden mb-4 relative">
        <div 
          className={`rounded-full absolute top-0 left-0 h-full transition-all duration-300 ${getColorClass()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;