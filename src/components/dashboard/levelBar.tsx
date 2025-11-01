import React from "react";

const LevelBar = () => {
  const progressWidth = "40%";

  return (
    <div className="relative w-90 h-full flex-shrink-0">
      {/* 1. Background Bar (Full dark track) */}
      <div className="absolute top-1/2 bg-[#101220] -translate-y-1/2 left-12 right-2 h-8 rounded-full" />

      <div
        className="absolute top-1/2 -translate-y-1/2 left-12 h-8 rounded-full flex items-center z-10 overflow-hidden relative bg-gradient-to-r from-blue to-purple"
        style={{
          width: progressWidth,
          boxShadow: `
            inset 0 0 10px rgba(162, 56, 255, 0.6),
            inset 0 0 20px rgba(103, 21, 255, 0.5),
            0 0 10px rgba(103, 21, 255, 0.6)
          `,
          transition: "box-shadow 0.3s ease",
        }}
      >
        <span className="pl-8 text-white font-main text-md whitespace-nowrap z-10">
          Level 5
        </span>
      </div>

      {/* 3. Hero Image */}
      <img
        src="/dashboard/levelBarHero.svg"
        alt="Level Hero"
        className="absolute left-9 top-7 -translate-y-1/2 w-10 h-12 z-20"
      />
    </div>
  );
};

export default LevelBar;
