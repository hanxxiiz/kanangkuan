"use client";

import React, { useState } from "react";
import FeedPanel from "@/components/profile/FeedPanel";
import StatsPanel from "@/components/profile/StatsPanel";
import DecksPanel from "@/components/profile/DecksPanel";
import Navbar from "@/components/profile/Navbar";
import { FaShare } from "react-icons/fa";
import ProfileCard from "@/components/profile/ProfileCard";


const ProfilePage = () => {
    const [activeIndex, setActiveIndex] = useState(0);

     const handleNavChange = (index: number) => {
    setActiveIndex(index);
  };
  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      {/* Main Section */}
      <section className="min-h-screen w-full transition-all duration-500 ease-in-out px-6 sm:px-12 md:px-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row my-6 mb-10 items-center justify-between max-w-full">
          <h1 className="font-bold text-4xl md:text-5xl text-gray-900 mb-4 sm:mb-0">
            Profile
          </h1>

          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 mx-2 rounded-full cursor-pointer 
                transition-all duration-200 transform hover:scale-110">
              <FaShare className="text-black" />
            </div>

            <div className="flex w-32 h-8 mx-2 rounded-full items-center justify-center text-black font-body font-bold border border-black transition-all duration-200 transform hover:scale-110">
              Profile
            </div>
          </div>
        </div>

        <ProfileCard />

        {/* Navbar */}
        <Navbar
          items={["Feed", "Stats", "Decks"]}
          activeIndex={activeIndex}
          onChange={handleNavChange}
          className="mb-8"
        />

        {/* Panel Content */}
        <section className="mt-6">
          {activeIndex === 0 && (
            <FeedPanel
              switchToDecks={() => {
                setActiveIndex(2);
              }}
            />
          )}
          {activeIndex === 1 && <StatsPanel />}
          {activeIndex === 2 && <DecksPanel />}
        </section>
      </section>
    </div>
  );
};

export default ProfilePage;
