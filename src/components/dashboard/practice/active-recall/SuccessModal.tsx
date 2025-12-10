import React, { useEffect, useState } from "react";
import Image from "next/image";

interface SuccessModalProps {
  isOpen: boolean;
  xpEarned: number;
  onClose: () => void;
  autoCloseDelay?: number;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  xpEarned,
  onClose,
  autoCloseDelay = 1500,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Control visibility and auto-close timer
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);

      const closeTimer = setTimeout(() => {
        setIsVisible(false);
        onClose(); 
      }, autoCloseDelay);

      return () => clearTimeout(closeTimer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen, onClose, autoCloseDelay]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
      <style>{`
        @keyframes slideDownFadeIn {
          from {
            opacity: 0;
            transform: translateY(-80px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .modal-enter {
          animation: slideDownFadeIn 0.25s ease-out;
        }
      `}</style>

      <div className="bg-gradient-to-b from-purple to-blue rounded-3xl p-8 max-w-xs sm:max-w-sm w-full flex flex-col items-center text-center pointer-events-auto modal-enter">
        {/* Mascot Image */}
        <div className="mb-6">
          <Image
            src="/practice/active-recall-mascot.svg"
            alt="Mascot"
            width={200}
            height={200}
            className="w-40 h-40 sm:w-55 sm:h-55"
          />
        </div>

        {/* Success Content */}
        <h2 className="text-lime text-2xl font-main">
          Good recall!
        </h2>
        <p className="text-white font-body text-lg mb-3">
          You earned +{xpEarned} XP!
        </p>
      </div>
    </div>
  );
};

export default SuccessModal;