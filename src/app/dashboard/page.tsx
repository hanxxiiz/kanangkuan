"use client";

import { useEffect, useState } from "react";
import DailyRewards from "@/components/dashboard/dailyRewards";
import DashboardHeader from "@/components/dashboard/dashboardHeader";
import LeaderboardCard from "@/components/dashboard/leaderboardCard";
import MonthlyProgress from "@/components/dashboard/monthlyProgress";
import DeckCard from "@/components/dashboard/deckCard";

export default function Dashboard() {
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport on mount & resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const leaderboardData = [
    { rank: 2, name: "username", xp: 666 },
    { rank: 1, name: "username", xp: 666 },
    { rank: 3, name: "username", xp: 666 },
  ];

  // if mobile, make sure rank 1 appears first
  const sortedLeaderboard = isMobile
    ? [...leaderboardData].sort((a, b) => {
        if (a.rank === 1) return -1;
        if (b.rank === 1) return 1;
        return a.rank - b.rank;
      })
    : leaderboardData;

  return (
    <div className="space-y-12">
      <DashboardHeader />
      <div className="justify-center items-center relative mx-auto max-w-[1000px] lg:max-w-[1200px] 2xl:max-w-[1500px] sm:px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-stretch ">
          <div className="lg:col-span-2 h-full">
            <MonthlyProgress />
          </div>
          <div className="lg:col-span-1 h-full">
            <DailyRewards />
          </div>
        </div>

        <div className="mt-14 text-left">
          <h2 className="text-[30px] sm:text-[35px] font-main text-[#101220] mb-3">
            Leaderboard
          </h2>
        </div>

        {/* Renders leaderboard — automatically reordered on mobile */}
        <div className="flex justify-center items-center sm:gap-0 lg:gap-6 flex-wrap md:flex-no-wrap lg:flex-wrap">
          {sortedLeaderboard.map((user) => (
            <LeaderboardCard
              key={user.rank}
              rank={user.rank as 1 | 2 | 3}
              name={user.name}
              xp={user.xp}
            />
          ))}
        </div>

        <div className="mt-14 text-left">
          <h2 className="text-[30px] sm:text-[35px] font-main text-[#101220] mb-3">
            Jump back in
          </h2>
        </div>
        {/* 2. USE THE NEW COMPONENT HERE */}
        {/* This grid will stack on mobile and go side-by-side on larger screens */}
        <div className="grid grid-cols-1 gap-6">
          <DeckCard deckName="Deck Name #1" cardCount={25} />
          <DeckCard deckName="Deck Name #1" cardCount={25} />
          <DeckCard deckName="Deck Name #1" cardCount={25} />
        </div>
        <div className="pt-10"></div>
      </div>
    </div>
  );
}
