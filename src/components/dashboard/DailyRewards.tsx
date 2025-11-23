"use client"

import React, { useState, useEffect } from "react";
import Image from "next/image";

type DailyRewardsProps = {
  onClick?: () => void; 
  hasSpun: boolean;
  nextSpinTime: string | null;
};

const DailyRewards: React.FC<DailyRewardsProps> = ({ onClick, hasSpun, nextSpinTime  }) => {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (!hasSpun || !nextSpinTime) {
      setTimeLeft("");
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(nextSpinTime).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft("Spin Now");
        return;
      }

      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [hasSpun, nextSpinTime]);

  const canSpin = !hasSpun || timeLeft === "Spin Now";

  return (
    <div className="w-full h-full">
      <div className="relative mx-auto w-full h-full rounded-3xl bg-[#6715FF] p-6 sm:p-8 text-white min-h-[260px] overflow-hidden shadow-[0px_8px_28px_-9px_rgba(0,0,0,0.45)]">
        <Image
          src="/dashboard/dashboard-mascot-2.png"
          alt="Decorative"
          width={350}
          height={350}
          className="absolute right-0 bottom-0 w-[350px] h-auto pointer-events-none opacity-80"
          style={{ zIndex: 0 }}
        />
        <div className="relative z-10">
          <h2 className="font-main text-2xl sm:text-3xl pb-0 sm:pb-2">Daily Reward</h2>
          <p className="mt-8 sm:mt-15 font-body text-md sm:text-2xl lg:text-xl leading-snug text-white/90">
            {canSpin 
              ? "Ready to unlock your daily surprise? The wheel is waiting for you."
              : "Your next chance awaits — return tomorrow to spin again!"}
          </p>
          <div className="mt-8 sm:mt-12">
            {canSpin ? (
              <button
                onClick={onClick}
                className="cursor-pointer min-w-[150px] px-6 py-3 bg-lime text-white font-main text-lg rounded-full hover:bg-pink hover:scale-105 transition-all duration-300"
              >
                Spin Now
              </button>
            ) : (
              <div className="mt-0 sm:mt-4 text-center inline-block w-[180px] px-6 py-3 bg-lime text-white font-main text-lg rounded-full backdrop-blur-sm">
                {timeLeft}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyRewards;