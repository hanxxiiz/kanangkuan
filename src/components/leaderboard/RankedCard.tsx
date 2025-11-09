import React from "react";

type RankedCardProps = {
  username: string;
  xp: number;
  ranking: number;
  imageUrl: string;
};

const RankedCard: React.FC<RankedCardProps> = ({ username, xp, ranking, imageUrl }) => {
  return (
    <div
      className="flex flex-col gap-4 rounded-3xl border border-[#CFCECE]
      bg-gradient-to-l from-white to-white
      transition-all duration-500 ease-out
      hover:from-[#FEEF69] hover:to-white
      hover:scale-105 transform
      drop-shadow-[0_12px_12px_rgba(0,0,0,0.25)]
      p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      {/* Left Section: Avatar + Username + XP (for mobile) */}
      <div className="flex items-center gap-4 sm:gap-6">
        <img
          src={imageUrl}
          alt={username}
          className="h-16 w-16 rounded-full object-cover sm:h-20 sm:w-20"
        />

        <div className="flex flex-col">
          <p className="font-body text-2xl text-gray-900 sm:text-3xl">{username}</p>
          {/* XP below username on mobile */}
          <p className="block sm:hidden font-body text-lg text-gray-900">{xp} XP</p>
        </div>

        {/* Rank on the right (mobile only) */}
        <p className="ml-auto block sm:hidden font-main text-2xl text-gray-900">
          {ranking + 3}
        </p>
      </div>

      {/* Right Section: XP + Rank (for desktop/tablet) */}
      <div className="hidden sm:flex items-center justify-end gap-6">
        <p className="font-body text-lg text-gray-900 sm:text-2xl">{xp} XP</p>
        <p className="font-main text-2xl text-gray-900 sm:text-4xl">{ranking + 3}</p>
      </div>
    </div>
  );
};

export default RankedCard;
