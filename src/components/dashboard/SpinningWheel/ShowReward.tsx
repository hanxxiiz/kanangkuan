import React, { useEffect } from "react";
import confetti from "canvas-confetti";

type ShowRewardProps = {
  isOpen: boolean;
  onClose: () => void;
  onGoBack: () => void; 
  reward: string;
  icon?: string;
};

const ShowReward: React.FC<ShowRewardProps> = ({ isOpen, onClose, onGoBack, reward, icon }) => {
  useEffect(() => {
    if (isOpen) {
      const duration = 2000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 400, ticks: 60, zIndex: 70 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center backdrop-blur-xs bg-black/40 p-4 animate-fadeIn"
    >
      <style>{`
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-zoomIn {
          animation: zoomIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
      <div className="animate-zoomIn relative w-full max-w-[480px] rounded-3xl overflow-visible shadow-2xl">
        <div className="relative h-[250px] bg-gradient-to-b from-pink-500 via-pink-400 to-orange-200 flex items-center justify-center rounded-t-3xl overflow-hidden">
        </div>
        <img 
          src="/dashboard/reward-mascot.svg" 
          alt="Mascot" 
          className="absolute top-[-70px] left-1/2 -translate-x-1/2 w-[380px] h-[380px] object-contain z-10"
        />
        <div className="relative bg-gradient-to-b from-gray-900 to-black px-8 py-8 rounded-b-3xl z-20">
          <h1 className="text-3xl font-main text-white text-center mb-1">
            Congratulations!
          </h1>
          <p className="text-lg font-regular text-lime text-center mb-6">
            You earned {reward}!
          </p>
          <button
            onClick={onGoBack}
            className="mx-auto w-53 flex items-center justify-center py-2 bg-lime cursor-pointer text-white text-lg font-main rounded-full hover:bg-pink hover:scale-105 transition-all duration-300 whitespace-nowrap mb-3"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowReward;