import React from "react";
import { useDashboard } from "@/components/dashboard/DashboardContext";

const ProfileLevelBar = () => {
  const { xp } = useDashboard();

  // Quadratic growth: XP needed for level n = 100 * n^2
  // Level 1→2: 100 XP, Level 2→3: 400 XP, Level 3→4: 900 XP, etc.
  const calculateLevel = (totalXp: number) => {
    // Formula: level = floor(sqrt(totalXp / 100)) + 1
    const level = Math.floor(Math.sqrt(totalXp / 100)) + 1;
    return level;
  };

  const getXpForLevel = (level: number) => {
    // XP needed to reach this level from level 1
    return 100 * (level - 1) * (level - 1);
  };

  const currentLevel = calculateLevel(xp);
  const xpForCurrentLevel = getXpForLevel(currentLevel);
  const xpForNextLevel = getXpForLevel(currentLevel + 1);
  const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
  const xpProgressInCurrentLevel = xp - xpForCurrentLevel;
  
  // Calculate progress percentage (0-100%)
  const progressPercentage = Math.min(
    (xpProgressInCurrentLevel / xpNeededForNextLevel) * 100,
    100
  );

  return (
    <div className="relative w-full h-full flex-shrink-0">
      {/* 1. Background Bar (Full dark track) */}
      <div className="absolute top-1/2 bg-[#101220] -translate-y-1/2 left-25 right-16 h-15 rounded-full" />

      {/* 2. Progress Bar */}
      <div
        className="absolute top-1/2 -translate-y-1/2 left-25 right-2 h-15 rounded-full z-10 overflow-hidden relative bg-gradient-to-r from-blue to-purple"
        style={{
          width: `${progressPercentage}%`,
          minWidth: "3rem",
          boxShadow: `
            inset 0 0 10px rgba(162, 56, 255, 0.6),
            inset 0 0 20px rgba(103, 21, 255, 0.5),
            0 0 10px rgba(103, 21, 255, 0.6)
          `,
          transition: "width 0.5s ease, box-shadow 0.3s ease",
        }}
      />

      {/* Level Text - Positioned above the bars */}
      <span className="absolute top-1/2 -translate-y-1/2 left-40 text-white font-main text-2xl whitespace-nowrap z-20">
        Level {currentLevel}
      </span>

      {/* 3. Hero Image */}
        <img
            src="/dashboard/levelBarHero.svg"
            alt="Level Hero"
            className="absolute left-9 top-2/5 -translate-y-1/2 w-25 h-27 z-20"
      />
    </div>
  );
};

export default ProfileLevelBar;