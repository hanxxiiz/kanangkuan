"use client";

import React, { useEffect, useState } from "react";
import Navbar from "../../../components/profile/Navbar";
import Top3Card from "../../../components/leaderboard/Top3Card";
import RankedCard from "../../../components/leaderboard/RankedCard";

const LeaderboardPage = () => {
  // Navbar
  const tabs = ["All Time", "Top 100", "XP"];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const leaderboardData = [
    { rank: 2, name: "username", xp: 666 },
    { rank: 1, name: "username", xp: 999 },
    { rank: 3, name: "username", xp: 555 },
  ];

  const sortedLeaderboard = isMobile
    ? [...leaderboardData].sort((a, b) => {
        if (a.rank === 1) return -1;
        if (b.rank === 1) return 1;
        return a.rank - b.rank;
      })
    : leaderboardData;

  type User = {
    username: string;
    xp: number;
    imageUrl: string;
  };

  const users: User[] = [
    { username: "Alice", xp: 500, imageUrl: "/temporary.png" },
    { username: "Bob", xp: 300, imageUrl: "/temporary.png" },
    { username: "Charlie", xp: 800, imageUrl: "/temporary.png" },
  ];

  const sortedUsers = [...users].sort((a, b) => a.xp - b.xp);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <section className="w-full max-w-6xl px-4 sm:px-6 lg:px-16 py-8 flex flex-col items-center">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between w-full mb-8 gap-4 text-center sm:text-left">
          <h1 className="font-main text-3xl sm:text-4xl lg:text-5xl text-gray-900">
            Leaderboard
          </h1>

          {/* Hide this part on mobile */}
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
          {activeIndex === 0 &&
          <div className="w-full flex flex-col items-center">
            {/* ALL TIME TAB */}
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
              {sortedLeaderboard.map((user) => (
                <Top3Card
                  key={user.rank}
                  rank={user.rank as 1 | 2 | 3}
                  name={user.name}
                  xp={user.xp}
                  variant="cyanToPink"
                />
              ))}
            </div>
            {/* Ranked Cards Section */}
            <div className="mt-10 flex flex-col gap-4 w-full max-w-3xl">
              {sortedUsers.map((user, index) => (
                <RankedCard
                  key={user.username}
                  username={user.username}
                  xp={user.xp}
                  ranking={index + 1}
                  imageUrl={user.imageUrl}
                />
              ))}
            </div>
          </div>}

          {/* TOP 100 TAB */}
          {activeIndex === 1 &&
          <div className="w-full flex flex-col items-center">
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
              {sortedLeaderboard.map((user) => (
                <Top3Card
                  key={user.rank}
                  rank={user.rank as 1 | 2 | 3}
                  name={user.name}
                  xp={user.xp}
                  variant="blueToPink"
                />
              ))}
            </div>
            {/* Ranked Cards Section */}
            <div className="mt-10 flex flex-col gap-4 w-full max-w-3xl">
              {sortedUsers.map((user, index) => (
                <RankedCard
                  key={user.username}
                  username={user.username}
                  xp={user.xp}
                  ranking={index + 1}
                  imageUrl={user.imageUrl}
                />
              ))}
            </div>
          </div>}

          {/* XP TAB */}
          {activeIndex === 2 &&
          <div className="w-full flex flex-col items-center">
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
              {sortedLeaderboard.map((user) => (
                <Top3Card
                  key={user.rank}
                  rank={user.rank as 1 | 2 | 3}
                  name={user.name}
                  xp={user.xp}
                  variant="limeToPink"
                />
              ))}
            </div>
            {/* Ranked Cards Section */}
            <div className="mt-10 flex flex-col gap-4 w-full max-w-3xl">
              {sortedUsers.map((user, index) => (
                <RankedCard
                  key={user.username}
                  username={user.username}
                  xp={user.xp}
                  ranking={index + 1}
                  imageUrl={user.imageUrl}
                />
              ))}
            </div>
          </div>
          }
        </section>
      </section>
    </div>
  );
};

export default LeaderboardPage;
