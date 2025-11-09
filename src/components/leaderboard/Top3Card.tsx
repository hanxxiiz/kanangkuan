"use client";

import React from "react";
import { GradientSets } from "./GradientSets";

type Top3CardVariant = keyof typeof GradientSets;

type Top3CardProps = {
  rank?: 1 | 2 | 3;
  name?: string;
  xp?: number;
  imageSrc?: string;
  // Gradient control
  variant?: Top3CardVariant;
};

const Top3Card: React.FC<Top3CardProps> = ({
  rank = 1,
  name = "username",
  xp = 666,
  imageSrc = "challenge.png",
  variant = "limeToPink", // default
}) => {
  const {
    baseFrom,
    baseTo,
    hoverFrom,
    hoverTo,
    badgeBase,
    badgeHover,
    badgeMobile,
  } = GradientSets[variant];

  return (
    <>
      {/* FOR LAPTOP/IPAD */}
      <div
        className={`hidden sm:block group relative w-full max-w-[260px] lg:max-w-[360px] rounded-[2rem] overflow-hidden cursor-pointer hover:scale-105 transform transition-transform duration-300 ease-in-out shadow-[0px_8px_28px_-9px_rgba(0,0,0,0.45)]
          ${rank === 1 ? "z-10" : ""}
          ${rank === 2 ? "sm:-mr-12 lg:mr-0" : ""}
          ${rank === 3 ? "sm:-ml-12 lg:ml-0" : ""}`}
      >
        {/* Top gradient area (height changes if rank === 1) */}
        <div
          className={`relative bg-gradient-to-b ${baseFrom} ${baseTo} transition-colors duration-[1000ms] ease-in-out group-hover:${hoverFrom} group-hover:${hoverTo}
            ${rank === 1 ? "md:h-[180px] lg:h-[210px]" : "md:h-[150px] lg:h-[200px]"}`}
        >
          {/* Profile image with overlapping rank badge */}
          <div className="absolute left-1/2 -bottom-[5rem] -translate-x-1/2 w-[150px] h-[150px] lg:w-[190px] lg:h-[190px]">
            <div className="relative w-full h-full rounded-full bg-white border-[10px] border-white/80 overflow-hidden">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[linear-gradient(45deg,_#e5e7eb_25%,_transparent_25%),_linear-gradient(-45deg,_#e5e7eb_25%,_transparent_25%),_linear-gradient(45deg,_transparent_75%,_#e5e7eb_75%),_linear-gradient(-45deg,_transparent_75%,_#e5e7eb_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0]" />
              )}
            </div>

            <div className="absolute -bottom-2 -right-2 w-14 h-14 rounded-full flex items-center justify-center text-[#65C110] font-main text-lg border-[4px] border-white">
              <div
                className={`absolute inset-0 rounded-full ${badgeBase} pointer-events-none`}
                aria-hidden
              />
              <div
                className={`absolute inset-0 rounded-full ${badgeHover} opacity-0 group-hover:opacity-100 transition-opacity duration-[1000ms] ease-in-out pointer-events-none`}
                aria-hidden
              />
              <span className="relative z-10 text-white transition-colors duration-[1000ms] ease-in-out">
                {rank}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom white panel */}
        <div
          className={`pt-[5.75rem] px-6 bg-white ${
            rank === 1
              ? "md:pb-[4rem] lg:pb-[6rem]"
              : "md:pb-[3.5rem] lg:pb-[5rem]"
          }`}
        >
          <h3 className="text-[#101220] font-main text-3xl text-center">
            {name}
          </h3>
          <p className="text-[#101220] font-body text-lg text-center">
            {xp} XP
          </p>
        </div>
      </div>

      {/* FOR MOBILE — stays the same height */}
      <div
        className="block sm:hidden relative w-full max-w-[500px] rounded-[1.5rem] overflow-hidden mb-5"
        style={{
          boxShadow:
            "0 15px 35px rgba(0,0,0,0.25), 0 5px 5px rgba(0,0,0,0.1)",
        }}
      >
        <div
          className={`relative h-[40px] bg-gradient-to-b ${
            baseFrom ?? "from-[#8AFF00]"
          } ${baseTo ?? "to-[#FFE566]"}`}
        >
          <div className="absolute left-20 -bottom-[5rem] -translate-x-1/2 w-[110px] h-[110px]">
            <div className="relative w-full h-full rounded-full bg-white border-[7px] border-white/80 overflow-hidden">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[linear-gradient(45deg,_#e5e7eb_25%,_transparent_25%),_linear-gradient(-45deg,_#e5e7eb_25%,_transparent_25%),_linear-gradient(45deg,_transparent_75%,_#e5e7eb_75%),_linear-gradient(-45deg,_transparent_75%,_#e5e7eb_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0]" />
              )}
            </div>

            <div
              className={`absolute bottom-0 -right-3 w-10 h-10 rounded-full flex items-center justify-center text-white font-main text-lg ${badgeMobile}`}
            >
              {rank}
            </div>
          </div>
        </div>

        <div className="bg-white h-[90px]">
          <h3 className="ml-25 text-[#101220] font-main text-2xl lg:text-3xl text-center">
            {name}
          </h3>
          <p className="ml-6 -mt-1 text-[#101220] font-regular text-md md:text-lg lg:text-xl text-center">
            {xp} XP
          </p>
        </div>
      </div>
    </>
  );
};

export default Top3Card;
