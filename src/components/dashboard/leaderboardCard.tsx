"use client";

import React from "react";

type LeaderboardCardProps = {
  rank?: 1 | 2 | 3; 
  name?: string;
  xp?: number;
  imageSrc?: string;
};

const getOrdinal = (rank?: 1 | 2 | 3) => {
  if (!rank) return "1st";
  return rank === 1 ? "1st" : rank === 2 ? "2nd" : "3rd";
};

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  rank = 1,
  name = "username",
  xp = 666,
  imageSrc = "challenge.png",
}) => {
  return (
    <div className="relative w-full max-w-[360px] rounded-[2rem] overflow-hidden shadow-xl" style={{
      boxShadow:
        "0 15px 35px rgba(0,0,0,0.25), 0 5px 5px rgba(0,0,0,0.1)",
    }}>
      {/* Top gradient area */}
      <div className="relative h-[220px] bg-gradient-to-b from-[#8AFF00] to-[#FFE566]">


      {/* Profile image with overlapping rank badge */}
      <div className="absolute left-1/2 -bottom-[5rem] -translate-x-1/2 w-[190px] h-[190px]">
        <div className="relative w-full h-full rounded-full bg-white border-[10px] border-white/80 overflow-hidden ">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null; 
                target.src = 'https://placehold.co/190x190/e2e8f0/e2e8f0';
              }}
            />
          ) : (
            <div className="w-full h-full bg-[linear-gradient(45deg,_#e5e7eb_25%,_transparent_25%),_linear-gradient(-45deg,_#e5e7eb_25%,_transparent_25%),_linear-gradient(45deg,_transparent_75%,_#e5e7eb_75%),_linear-gradient(-45deg,_transparent_75%,_#e5e7eb_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0]" />
          )}
        </div>

        {/* Rank circle (overlapping, not contained) */}
        <div
          className="absolute -bottom-2 -right-5 w-14 h-14 rounded-full flex items-center justify-center 
          text-[#65C110] font-main text-lg border-[4px] border-white 
          bg-[radial-gradient(circle_at_center,_#96FD0B_10%,_#DFF34D_80%)]"
        >
          {rank}
        </div>

      </div>


      </div>

      {/* Bottom white panel */}
      <div className="pt-[5.75rem] pb-[5rem] px-6 bg-white rounded-t-[2rem]">
        <h3 className="text-[#101220] font-main text-3xl text-center">{name}</h3>
        <p className=" text-[#101220] font-regular text-xl text-center">{xp} XP</p>
      </div>
    </div>
  );
};

export default LeaderboardCard;
