"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSupabase } from "../providers/SupabaseProvider";
import { useDashboard } from "./DashboardContext";

type PresetGradientSet = {
  baseFrom: string;
  baseTo: string;
  hoverFrom: string;
  hoverTo: string;
  badgeBase: string;
  badgeHover: string;
  badgeMobile: string;
};

export const GradientSets = {
  blueToPink: {
    baseFrom: "from-blue",
    baseTo: "to-[#FFE566]",
    hoverFrom: "from-pink",
    hoverTo: "to-[#FFE566]",
    badgeBase: "bg-blue",
    badgeHover: "bg-pink",
    badgeMobile: "bg-cyan",
  },
  limeToPink: {
    baseFrom: "from-lime",
    baseTo: "to-[#FFE566]",
    hoverFrom: "from-pink",
    hoverTo: "to-[#FFE566]",
    badgeBase: "bg-lime",
    badgeHover: "bg-pink",
    badgeMobile: "bg-lime",
  },
  cyanToPink: {
    baseFrom: "from-cyan",
    baseTo: "to-[#FFE566]",
    hoverFrom: "from-pink",
    hoverTo: "to-[#FFE566]",
    badgeBase: "bg-cyan",
    badgeHover: "bg-pink",
    badgeMobile: "bg-blue",
  },
};

type LeaderboardCardProps = {
  rank?: 1 | 2 | 3;
  name?: string;
  xp?: number;
  imageSrc?: string;
  gradientSet?: PresetGradientSet;
  userId?: string;
};

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  rank = 1,
  name = "username",
  xp = 666,
  imageSrc = "/dashboard/default-picture.png",
  gradientSet,
  userId,
}) => {

  const defaultGradient: PresetGradientSet = {
    baseFrom: "from-lime",
    baseTo: "to-[#FFE566]",
    hoverFrom: "from-pink",
    hoverTo: "to-[#FFE566]",
    badgeBase: "bg-lime",
    badgeHover: "bg-pink",
    badgeMobile: "bg-purple",
  };

  const gradient = gradientSet || defaultGradient;
  const { supabase, session } = useSupabase();
  const { username: currentUsername } = useDashboard();
  const router = useRouter();
  const handleClick = async () => {
    if(!userId){
      return;
    }
    const viewerId = session?.user?.id;
    const viewerName = currentUsername || "Someone";
    if (supabase && viewerId && viewerId !== userId) {
      const { error } = await supabase.from("notifications").insert({
        user_id: userId,
        type: "profile_view",
        message: `${viewerName} viewed your profile`,
        read: false,
      });
      if (error) {
        console.error("Failed to log profile_view notification:", error?.message ?? error);
      }
    }
    router.push(`/dashboard/profile/${userId}`);
  };

  return (
    <>
      {/* FOR LAPTOP/IPAD */}
      <div
      onClick={handleClick}
        className={`hidden sm:block group relative w-full max-w-[260px] lg:max-w-[360px] rounded-[2rem] overflow-hidden 
          cursor-pointer hover:scale-105 transform transition-transform duration-300 ease-in-out 
          shadow-[0px_8px_28px_-9px_rgba(0,0,0,0.45)] hover:cursor-pointer
          ${rank === 1 ? "z-10" : ""}
          ${rank === 2 ? "sm:-mr-12 lg:mr-0" : ""}
          ${rank === 3 ? "sm:-ml-12 lg:ml-0" : ""}`}
      >
        <div
          className={`relative bg-gradient-to-b ${gradient.baseFrom} ${gradient.baseTo}
          transition-colors duration-[1000ms] ease-in-out group-hover:${gradient.hoverFrom} group-hover:${gradient.hoverTo}
          ${
            rank === 1
              ? "md:h-[180px] lg:h-[210px]"
              : "md:h-[150px] lg:h-[200px]"
          }`}
        >
          <div className="absolute left-1/2 -bottom-[5rem] -translate-x-1/2 w-[150px] h-[150px] lg:w-[190px] lg:h-[190px]">
            <div className="relative w-full h-full rounded-full bg-white border-[10px] border-white/80 overflow-hidden">
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={name}
                  width={190}
                  height={190}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[linear-gradient(45deg,_#e5e7eb_25%,_transparent_25%),_linear-gradient(-45deg,_#e5e7eb_25%,_transparent_25%),_linear-gradient(45deg,_transparent_75%,_#e5e7eb_75%),_linear-gradient(-45deg,_transparent_75%,_#e5e7eb_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0]" />
              )}
            </div>
            <div className="absolute -bottom-2 -right-1 w-15 h-15 rounded-full flex items-center justify-center text-[#65C110] font-main text-lg border-[4px] border-white">
              <div
                className={`absolute inset-0 rounded-full ${gradient.badgeBase} pointer-events-none`}
                aria-hidden
              />
              <div
                className={`absolute inset-0 rounded-full ${gradient.badgeHover} opacity-0 group-hover:opacity-100 transition-opacity duration-[1000ms] ease-in-out pointer-events-none`}
                aria-hidden
              />
              <span className="relative z-10 text-white transition-colors duration-[1000ms] ease-in-out">
                {rank}
              </span>
            </div>
          </div>
        </div>

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
      onClick={handleClick}
        className="block sm:hidden relative w-full max-w-[500px] rounded-[1.5rem] overflow-hidden mb-5"
        style={{
          boxShadow:
            "0 15px 35px rgba(0,0,0,0.25), 0 5px 5px rgba(0,0,0,0.1)",
        }}
      >
        <div className="relative h-[40px] bg-lime">
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-[5rem] w-[110px] h-[110px] z-10">
            <div className="relative w-full h-full rounded-full bg-black border-[7px] border-black overflow-hidden">
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={name}
                  width={110}
                  height={110}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[linear-gradient(45deg,_#e5e7eb_25%,_transparent_25%),_linear-gradient(-45deg,_#e5e7eb_25%,_transparent_25%),_linear-gradient(45deg,_transparent_75%,_#e5e7eb_75%),_linear-gradient(-45deg,_transparent_75%,_#e5e7eb_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0]" />
              )}
            </div>
            <div
              className="absolute bottom-0 -right-3 w-10 h-10 rounded-full flex items-center justify-center 
              text-white font-main text-lg bg-purple"
            >
              {rank}
            </div>
          </div>
        </div>

        <div className="bg-black pt-[80px] pb-4 px-4">
          <h3 className="text-white font-main text-2xl text-center truncate">
            {name}
          </h3>
          <p className="text-white font-regular text-md text-center mt-1">
            {xp} XP
          </p>
        </div>
      </div>
    </>
  );
};

export default LeaderboardCard;