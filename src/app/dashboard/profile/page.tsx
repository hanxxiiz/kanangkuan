"use client";

import React, { useState } from "react";
import FeedPanel from "@/components/profile/FeedPanel";
import StatsPanel from "@/components/profile/StatsPanel";
import DecksPanel from "@/components/profile/DecksPanel";
import Navbar from "@/components/profile/Navbar";
import { FaShare } from "react-icons/fa";

const ProfilePage = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNavChange = (index: number, label: string) => {
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

     {/* Profile Card */}
        <section className=" rounded-2xl overflow-hidden">
          <div className="relative w-full h-auto sm:h-70">
            {/* Gradient Background */}
            <div
              className="absolute inset-0 h-50 sm:h-50 w-full rounded-2xl"
              style={{
                background:
                  "linear-gradient(80deg, #8AFF00 0%, #00FFD1 44%, #00FFD1 100%)",
              }}
            ></div>

            {/* Desktop Layout */}
            <div className="hidden sm:flex relative items-start h-70 w-full">
              {/* Profile Image */}
              <img
                src="mascot-hero.svg"
                className="absolute bottom-0 m-10 max-w-xs max-h-xs w-50 h-50 rounded-full bg-gray-900 z-10"
              />
              {/* User Info */}
              <div className="relative flex flex-col left-70 top-10">
                <p className="text-gray-900 text-4xl font-bold font-main">
                  [Username]
                </p>
                <p className="text-gray-900 text-2xl font-body my-2">[Name]</p>
                <div className="flex items-center">
                  <p className="text-gray-800 text-md font-body">0 Following</p>
                  <div className="w-1 h-1 bg-gray-900 rounded-full m-3"></div>
                  <p className="text-gray-900 text-md font-body">0 Followers</p>
                </div>
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="flex flex-col sm:hidden relative items-center pt-8 pb-4 text-center">
              <p className="text-gray-900 text-3xl font-bold font-main">
                [Username]
              </p>
              <p className="text-gray-900 text-xl font-body my-1">[Name]</p>
              <div className="flex items-center justify-center mt-2">
                <p className="text-gray-800 text-sm font-body">0 Following</p>
                <div className="w-1 h-1 bg-gray-900 rounded-full mx-2"></div>
                <p className="text-gray-900 text-sm font-body">0 Followers</p>
              </div>
              {/* Image below the info */}
              <img
                src="mascot-hero.svg"
                className="mt-6 w-32 h-32 rounded-full bg-gray-900 z-10"
              />
            </div>
          </div>
        </section>

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
