import React from "react";
import { PiLightbulbBold } from "react-icons/pi";

type ShowRewardProps = {
  isOpen: boolean;
  onClose: () => void;
  onGoBack: () => void; 
  reward: string;
  icon?: string;
};

const ShowReward: React.FC<ShowRewardProps> = ({ isOpen, onClose, onGoBack, reward, icon }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Determine background color based on reward type
  const getBackgroundColor = () => {
    const rewardLower = reward.toLowerCase();
    
    if (rewardLower.includes('live') || rewardLower.includes('life') || rewardLower.includes('heart')) {
      return 'bg-lime';
    } else if (rewardLower.includes('key')) {
      return 'bg-pink';
    } else if (rewardLower.includes('hint') || rewardLower.includes('bulb')) {
      return 'bg-blue';
    } else if (rewardLower.includes('xp') || rewardLower.includes('star') || rewardLower.includes('experience')) {
      return 'bg-purple-500';
    }
    
    // Default to pink if no match
    return 'bg-pink';
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
      onClick={handleBackdropClick}
    >
      <div className={`relative w-full max-w-[480px] h-[480px] sm:h-[550px] max-h-[80vh] rounded-3xl flex flex-col justify-end items-center overflow-hidden ${getBackgroundColor()}`}>
        {/* Sunburst pattern */}
        <div
          className="opacity-60 absolute top-[-80px] sm:top-[-100px] left-1/2 -translate-x-1/2 w-[400px] sm:w-[500px] h-[400px] sm:h-[500px] z-10"
          style={{
            background: `
              repeating-conic-gradient(
                from 0deg,
                rgba(255, 255, 255, 0.3) 0deg,
                rgba(255, 255, 255, 0.3) 10deg,
                rgba(255, 255, 255, 0) 10deg,
                rgba(255, 255, 255, 0) 20deg
              )
            `,
          }}
        />

        {/* Icon centered on sunburst */}
        {icon && (
          <div className="absolute top-[70px] sm:top-[100px] left-1/2 -translate-x-1/2 z-30">
            <img src={icon} alt="Reward" className="w-35 h-35 sm:w-32 sm:h-32 object-contain" />
          </div>
        )}

        {/* White lower section */}
        <div className="absolute bottom-0 left-0 w-full h-[45%] sm:h-[45%] bg-white z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]" />

        <div className="relative z-30 flex flex-col items-center pb-16 sm:pb-14 px-6 sm:px-8 w-full gap-2 sm:gap-4">
          <h1 className="text-3xl font-main text-[#101220] text-center">Congratulations!</h1>
          <p className="-mt-1 sm:-mt-3 text-md sm:text-lg font-regular text-[#101220] text-center">You won {reward}!</p>
          <button
            onClick={onGoBack} 
            className="cursor-pointer min-w-[140px] sm:min-w-[160px] px-5 sm:px-6 py-2.5 sm:py-3 bg-lime text-white font-main text-sm sm:text-lg rounded-full hover:bg-pink hover:scale-105 transition-all duration-300 mt-1 sm:mt-2"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowReward;