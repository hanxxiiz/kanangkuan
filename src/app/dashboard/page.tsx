"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DailyRewards from "@/components/dashboard/DailyRewards";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import LeaderboardCard from "@/components/dashboard/LeaderboardCard";
import DeckCard, {EmptyDeckState} from "@/components/dashboard/DeckCard";
import SpinWheel from "@/components/dashboard/SpinningWheel/SpinningWheel";
import MonthlyProgress from "@/components/dashboard/MonthlyProgress";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { CheckAndResetDailyLimits, GetTimeUntilNextSpin } from "@/lib/actions/daily-rewards-actions";


export default function Dashboard() {
  const router = useRouter(); 

  const { userId, username, xp, profileUrl, leaderboardData, recentDecks, cardCounts, hasSpun, nextSpinTime, refreshDailyLimits } = useDashboard();
  
  const [isMobile, setIsMobile] = useState(false);
  const [isWheelOpen, setIsWheelOpen] = useState(false);


  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    router.refresh();
  }, [router]);

  useEffect(() => {
    const handleFocus = () => router.refresh();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [router]);

  

  const sortedLeaderboard = isMobile
    ? [...leaderboardData].sort((a, b) => {
        if (a.rank === 1) return -1;
        if (b.rank === 1) return 1;
        return a.rank - b.rank;
      })
    : [...leaderboardData].sort((a, b) => { 
        const order = { 2: 0, 1: 1, 3: 2 };
        return (order[a.rank as keyof typeof order] ?? a.rank) - (order[b.rank as keyof typeof order] ?? b.rank);
      });

  return (
    <div className="space-y-12">
      <DashboardHeader />
      <div className="justify-center items-center relative mx-auto max-w-[1000px] lg:max-w-[1300px] sm:px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-stretch">
          <div className="lg:col-span-2 h-full">
            <MonthlyProgress />
          </div>
          <div className="lg:col-span-1 h-full">
            <DailyRewards onClick={() => setIsWheelOpen(true)} 
              hasSpun={hasSpun}
              nextSpinTime={nextSpinTime} 
            />
          </div>
        </div>

        <div className="mt-14 text-left">
          <h2 className="text-[30px] sm:text-[35px] font-main text-[#101220] mb-3">
            Leaderboard
          </h2>
        </div>

        <div className="flex justify-center items-center sm:gap-0 lg:gap-6 flex-wrap md:flex-no-wrap lg:flex-wrap">
          {sortedLeaderboard.map((user) => (
            <LeaderboardCard
              key={user.rank}
              rank={user.rank as 1 | 2 | 3}
              name={user.username}
              xp={user.xp}
              imageSrc={user.profile_url || undefined}
            />
          ))}
        </div>

        <div className="mt-14 text-left">
          <h2 className="text-[30px] sm:text-[35px] font-main text-[#101220] mb-3">
            Jump back in
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {recentDecks.length > 0 ? (
            recentDecks.map((deck) => (
              <DeckCard
                key={deck.id}
                deckId={deck.id}  
                deckName={deck.deck_name}
                deckColor={deck.deck_color}
                cardCount={cardCounts[deck.id] || 0}
              />
            ))
          ) : (
            <EmptyDeckState />
          )}
        </div>

        <div className="pt-10"></div>
      </div>
            
      <SpinWheel
        isOpen={isWheelOpen}
        onClose={() => setIsWheelOpen(false)}
      />
    </div>
  );
}