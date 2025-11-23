"use client";

import React, { useEffect, useState } from "react";
import Navbar from "../../../components/profile/Navbar";
import Top3Card from "../../../components/leaderboard/Top3Card";
import RankedCard from "../../../components/leaderboard/RankedCard";
import { useSupabase } from "@/components/providers/SupabaseProvider";

const LeaderboardPage = () => {
  const { supabase } = useSupabase();

  // Navbar
  const tabs = ["All Time", "Top 100", "XP"];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      setLoading(true);
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

    loadLeaderboard();
  }, [supabase]);

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
    profileUrl: user.profile_url
  }));

  // Ranked users excluding top 3
  const rankedUsers = leaderboard.slice(3).map((user, index) => ({
    username: user.username,
    xp: user.xp,
    imageUrl: user.profile_url,
    ranking: index + 4
  }));

  const mobileTop3 = isMobile
    ? [...top3].sort((a, b) => a.rank === 1 ? -1 : b.rank === 1 ? 1 : a.rank - b.rank)
    : top3;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <section className="w-full max-w-6xl px-4 sm:px-6 lg:px-16 py-8 flex flex-col items-center">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between w-full mb-8 gap-4 text-center sm:text-left">
          <h1 className="font-main text-3xl sm:text-4xl lg:text-5xl text-gray-900">
            Leaderboard
          </h1>

          {/* Hide This On Mobile */}
          <div className="hidden sm:flex">
            <div className="border border-gray-900 px-4 py-2 rounded-full text-gray-900 font-body font-bold text-sm sm:text-base">
              Leaderboard
            </div>
          </div>
        </div>

        {/* Navbar */}
        <div className="mb-8 w-full">
          <Navbar items={tabs} onChange={(idx) => setActiveIndex(idx)} />
        </div>

        {/* Main Content */}
        <section className="w-full flex flex-col items-center">
          <div className="w-full flex flex-col items-center">
            
            {/* Top 3 */}
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
              {mobileTop3.map((user) => (
                <Top3Card
                  key={user.rank}
                  rank={user.rank as 1 | 2 | 3}
                  name={user.name}
                  xp={user.xp}
                  imageSrc={user.profileUrl}
                  variant={
                    activeIndex === 0
                      ? "cyanToPink"
                      : activeIndex === 1
                      ? "blueToPink"
                      : "limeToPink"
                  }
                />
              ))}
            </div>

            {/* Ranked Cards */}
            <div className="mt-10 flex flex-col gap-4 w-full max-w-3xl">
              {rankedUsers.slice(0, activeIndex === 1 ? 100 : rankedUsers.length).map((user) => (
                <RankedCard
                  key={user.username}
                  username={user.username}
                  xp={user.xp}
                  ranking={user.ranking}
                  imageUrl={user.imageUrl}
                />
              ))}
            </div>
          </div>
        </section>
      </section>
    </div>
  );
};

export default LeaderboardPage;
