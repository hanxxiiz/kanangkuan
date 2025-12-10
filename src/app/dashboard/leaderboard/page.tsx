"use client";

import React, { useEffect, useState } from "react";
import Navbar from "../../../components/profile/Navbar";
import LeaderboardCard, {GradientSets} from "../../../components/dashboard/LeaderboardCard";
import RankedCard from "../../../components/leaderboard/RankedCard";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { useDashboard } from "@/components/dashboard/DashboardContext";

interface LeaderboardUser {
  id: string;
  username: string;
  xp: number;
  profile_url: string | null;
}


const LeaderboardPage = () => {
  const { supabase } = useSupabase();
  const { session } = useSupabase();
  const { leaderboardData } = useDashboard();
  // Navbar
  const tabs = ["All Time", "Top 100", "XP"];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

   const gradientMap = {
    0: GradientSets.cyanToPink, // All Time
    1: GradientSets.blueToPink, // Top 100
    2: GradientSets.limeToPink, // XP
  } as const;

  //Get current gradient based on active tab
  const currentGradient = gradientMap[activeIndex as keyof typeof gradientMap];

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch leaderboard data
  useEffect(() => {
    const loadLeaderboard = async () => {
      if (!supabase) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, xp, profile_url")
        .order("xp", { ascending: false }); // Highest XP first

      if (error) {
        console.error("Error loading leaderboard:", error);
      } else {
        setLeaderboard(data ?? []);
      }

      setLoading(false);
    };

    // Initial load
    setLoading(true);
    loadLeaderboard();

    // Poll every 5 seconds to detect XP changes
    const interval = setInterval(() => {
      loadLeaderboard();
    }, 5000);

    return () => clearInterval(interval);
  }, [supabase]);

  // Detect overtake: if the user directly above you changes, notify once.
  const prevAboveRef = React.useRef<string | null>(null);
  const initializedRef = React.useRef(false);
  useEffect(() => {
    if (!session?.user?.id || !supabase || leaderboard.length === 0) return;
    const currentUserId = session.user.id;
    const idx = leaderboard.findIndex((u) => u.id === currentUserId);
    if (idx === -1) {
      // User not found in leaderboard, reset tracking
      prevAboveRef.current = null;
      initializedRef.current = false;
      return;
    }

    const aboveId = idx > 0 ? leaderboard[idx - 1]?.id ?? null : null;
    const aboveName = idx > 0 ? leaderboard[idx - 1]?.username ?? "Someone" : null;

    // On first load, just set baseline
    if (!initializedRef.current) {
      prevAboveRef.current = aboveId;
      initializedRef.current = true;
      console.log(`[Overtake] Initialized: User at rank ${idx + 1}, user above: ${aboveName || "none"}`);
      return;
    }

    // If the above user changed, treat as an overtake
    if (aboveId && aboveId !== prevAboveRef.current && prevAboveRef.current !== null) {
      console.log(`[Overtake] Detected: ${aboveName} overtook you! Previous: ${prevAboveRef.current}, New: ${aboveId}`);
      supabase
        .from("notifications")
        .insert({
          user_id: currentUserId,
          type: "overtake",
          message: `${aboveName} overtook you on the leaderboard`,
          read: false,
        })
        .then(({ error }) => {
          if (error) {
            console.error("Failed to log overtake notification:", error.message ?? error);
          } else {
            console.log(`[Overtake] Notification created successfully for ${aboveName}`);
          }
        });
    }

    prevAboveRef.current = aboveId;
  }, [leaderboard, session?.user?.id, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-main">
        Loading leaderboard...
      </div>
    );
  }

  // Compute top 3
  const top3 = leaderboard.slice(0, 3).map((user, i) => ({
    rank: i + 1,
    name: user.username,
    xp: user.xp,
    profileUrl: user.profile_url,
    userId: user.id,
  }));

  // Ranked users excluding top 3
  const rankedUsers = leaderboard.slice(3).map((user, index) => ({
    username: user.username,
    xp: user.xp,
    imageUrl: user.profile_url,
    ranking: index + 4,
    userId: user.id,
  }));

  const mobileTop3 = isMobile
    ? [...top3].sort((a, b) => a.rank === 1 ? -1 : b.rank === 1 ? 1 : a.rank - b.rank)
    : top3;

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

      const gradientBackup = (
    <div className="hidden
      from-blue from-lime from-cyan from-pink
      to-[#FFE566]
      group-hover:from-blue group-hover:from-lime group-hover:from-cyan group-hover:from-pink
      bg-blue bg-lime bg-cyan bg-pink
    " />
  );

  return (
    <>
    {gradientBackup}
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <section className="w-full max-w-6xl px-4 sm:px-6 lg:px-16 py-8 flex flex-col items-center">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between w-full mb-8 gap-4 text-center sm:text-left">
          <h1 className="font-main text-3xl sm:text-4xl lg:text-5xl text-gray-900">
            Leaderboard
          </h1>
        </div>

        {/* Navbar */}
        <div className="mb-8 w-full">
          <Navbar items={tabs} onChange={(idx) => setActiveIndex(idx)} />
        </div>

        {/* Main Content */}
        <section className="w-full flex flex-col items-center">
          <div className="w-full flex flex-col items-center">
            
            {/* Top 3 */}
            <div className="flex justify-center items-center grid grid-cols-3 sm:gap-0 lg:gap-6 flex-wrap md:flex-no-wrap lg:flex-wrap">
              {top3
                .sort((a, b) => {
                  // Reorder: rank 2 (left), rank 1 (center), rank 3 (right)
                  const order = { 2: 0, 1: 1, 3: 2 };
                  return (order[a.rank as keyof typeof order] ?? a.rank) - (order[b.rank as keyof typeof order] ?? b.rank);
                })
                .map((user, index) => (
                  <LeaderboardCard
                    key={user.userId ?? `${user.rank}-${index}`}
                    rank={user.rank as 1 | 2 | 3}
                    name={user.name}
                    xp={user.xp}
                    imageSrc={user.profileUrl || undefined}
                    userId={user.userId}
                    gradientSet={currentGradient}
                  />
                ))}
            </div>

            {/* Ranked Cards */}
            <div className="mt-10 flex flex-col gap-4 w-full max-w-3xl">
              {rankedUsers.slice(0, activeIndex === 1 ? 100 : rankedUsers.length).map((user) => (
                <RankedCard
                  key={`${user.username}-${user.ranking}`}
                  username={user.username}
                  xp={user.xp}
                  ranking={user.ranking}
                  imageUrl={user.imageUrl}
                  userId={user.userId}
                />
              ))}
            </div>
          </div>
        </section>
      </section>
    </div>
    </>
  );
};

export default LeaderboardPage;
