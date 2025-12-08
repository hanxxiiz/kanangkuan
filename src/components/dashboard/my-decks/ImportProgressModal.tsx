"use client";

import { Dispatch, SetStateAction, useState, useEffect } from "react";
import Image from "next/image";

interface ImportProgressModalProps {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  progress: number; 
  statusText?: string;
}

function ImportProgressModal({
  showModal,
  setShowModal,
  progress,
  statusText = "Extracting the text...",
}: ImportProgressModalProps) {
  const [currentFrame, setCurrentFrame] = useState(1);

  useEffect(() => {
    if (!showModal) return;

    const blinkSequence = () => {
      // Blink animation: 1 -> 2 -> 3 -> 4 -> 1
      setCurrentFrame(2);
      setTimeout(() => setCurrentFrame(3), 100);
      setTimeout(() => setCurrentFrame(4), 200);
      setTimeout(() => setCurrentFrame(1), 300);
    };

    // Initial delay before first blink
    const initialTimeout = setTimeout(() => {
      blinkSequence();
      
      // Random delay between blinks (2-5 seconds)
      const scheduleNextBlink = () => {
        const delay = Math.random() * 3000 + 2000;
        setTimeout(() => {
          blinkSequence();
          scheduleNextBlink();
        }, delay);
      };
      
      scheduleNextBlink();
    }, 2000);

    return () => clearTimeout(initialTimeout);
  }, [showModal]);

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop with blur - NO onClick */}
          <div className="absolute inset-0 bg-black/25 backdrop-blur-xs" />

          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-xl p-8 w-full max-w-xl mx-4 z-10 flex flex-col items-center">
            {/* Main Mascot with Blinking Animation */}
            <div className="mb-6">
              <Image
                src={`/ai-import/ai-import-mascot${currentFrame}.svg`}
                alt="AI Import Mascot"
                width={200}
                height={200}
                className="w-48 h-48"
              />
            </div>

            {/* Status Text */}
            <h2 className="text-xl font-bold text-[#E91E92] mb-1 font-main">
              {statusText}
            </h2>

            {/* Progress Bar Container */}
            <div className="relative w-full h-12 flex items-center px-8">
              {/* Background Track with overflow hidden */}
              <div className="absolute left-8 right-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                {/* Glow layer that follows purple fill - INSIDE container */}
                <div
                  className="absolute left-0 h-full transition-all duration-500 ease-out"
                  style={{
                    width: `${progress}%`,
                    background: 'radial-gradient(ellipse at center, rgba(233, 30, 146, 0.4) 0%, rgba(107, 33, 255, 0.3) 50%, transparent 100%)',
                    filter: 'blur(8px)',
                  }}
                />
                
                {/* Progress Fill - now inside the container */}
                <div
                  className="absolute left-0 h-full bg-gradient-to-r from-[#6B21FF] to-[#A238FF] transition-all duration-500 ease-out"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>

              {/* Mascot on Progress Bar */}
              <div
                className="absolute -mt-2 z-20 transition-all duration-500 ease-out"
                style={{
                  left: `calc(1.5rem + ((100% - 6rem) * ${progress} / 100))`,
                }}
              >
                <Image
                  src="/dashboard/levelBarHero.svg"
                  alt="Progress Mascot"
                  width={40}
                  height={40}
                  className="w-12 h-12"
                />
              </div>
            </div>

            {/* Percentage Text */}
            <div className=" text-lg font-bold text-[#7FFF00] font-main mb-4">
              {progress}%
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ImportProgressModal;