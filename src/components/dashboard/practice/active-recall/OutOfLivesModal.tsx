import React from "react";
import Image from "next/image";

interface OutOfLivesModalProps {
  isOpen: boolean;
  onReturnToDeck: () => void;
}

const OutOfLivesModal: React.FC<OutOfLivesModalProps> = ({
  isOpen,
  onReturnToDeck,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/25 backdrop-blur-xs flex items-center justify-center z-50 p-4">
    <div className="bg-gradient-to-b from-black to-gray-700 rounded-3xl p-8 max-w-[550px] w-full flex flex-col items-center text-center">
        {/* Mascot Image */}
        <div className="pt-2 mb-6">
          <Image
            src="/practice/active-recall-mascot.svg"
            alt="Mascot"
            width={200}
            height={200}
            className="w-65 h-65"
          />
        </div>

        {/* Out of Lives Content */}
        <h2 className="text-white text-2xl font-main">
          {`You're out of lives!`}
        </h2>
        <p className="text-white font-body text-lg mb-6">
          {`You've used all yours lives for today. Come back tomorrow!`}
        </p>
        
        <button
          onClick={onReturnToDeck}
          className="cursor-pointer px-7 bg-lime text-white py-3 rounded-full text-lg font-main hover:bg-pink transition-colors duration-500 mb-5 "
        >
          Return to Deck
        </button>
      </div>
    </div>
  );
};

export default OutOfLivesModal;