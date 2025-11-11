"use client";

import React, { useState } from "react";
import { RiArrowDropDownLine } from "react-icons/ri";
import { FaRegCircleCheck, FaCheck } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import NotificationCards from "@/components/notification/NotificationCards";
import FilterDropdown from "@/components/notification/FilterDropdown";

const NotificationPage = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  const handleFilterToggle = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-16 ">
      {/* Header Section */}
      <div className="flex sm:flex-row items-center justify-between w-full mb-8 gap-4 text-center sm:text-left">
        <h1 className="font-main text-3xl sm:text-4xl lg:text-5xl text-gray-900">
          Notification
        </h1>

        <div className="hidden sm:flex">
          <div className="border border-gray-900 px-4 py-2 rounded-full text-gray-900 font-body font-bold text-sm sm:text-base">
            Notification
          </div>
        </div>
      </div>

      {/* Filter Button & Dropdown */}
      <div className="flex justify-end relative">
        <div className="relative inline-block">
          <button
            onClick={handleFilterToggle}
            className="flex items-center gap-1 text-gray-500 text-md font-body group transition-colors"
          >
            <span className="group-hover:text-black transition-colors">
              Filter
            </span>
            <RiArrowDropDownLine
              className={`text-3xl transform transition-transform duration-300 group-hover:text-black ${
                isDropdownOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>

          {/* Dropdown (now behaves like ProfileDropdown) */}
          <FilterDropdown
            isOpen={isDropdownOpen}
            onClose={() => setIsDropdownOpen(false)}
            onFilterSelect={(value) => console.log("Selected:", value)}
          />
        </div>
      </div>

      {/* Notification List */}
      <div className="flex flex-col border-black border-t-1 border-l-1 border-r-1 rounded-t-2xl my-5 shadow-[0_12px_12px_rgba(0,0,0,0.25)]">
        <div className="flex flex-row items-center border-b border-black rounded-t-2xl h-14">
          {/* Select All Button */}
          <button
            onClick={() => setIsSelected((prev) => !prev)}
            className="gap-2 flex items-center justify-center my-4 ml-10 mr-15 bg-white hover:cursor-pointer transition-all duration-300 mx-5"
          >
            <div
              className={`border border-black rounded-sm h-6 w-6 flex items-center justify-center transition-all duration-300 ${
                isSelected ? "bg-black" : "bg-white"
              }`}
            >
              <FaCheck
                className={`text-white text-sm transition-opacity duration-200 ${
                  isSelected ? "opacity-100" : "opacity-0"
                }`}
              />
            </div>
            <h1 className="text-black text-md font-body">Select All</h1>
          </button>

          {/* Done Button with Framer Motion */}
          <AnimatePresence>
            {isSelected && (
              <motion.button
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{
                  type: "tween",
                  ease: "easeInOut",
                  duration: 0.5,
                }}
                className="gap-2 flex items-center justify-center p-1 border border-black rounded-sm hover:cursor-pointer transition-all duration-300 hover:bg-gray-100"
              >
                <FaRegCircleCheck className="text-black" />
                <h1 className="text-black text-md font-body">Done</h1>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Notification Cards */}
        <div className="flex flex-col gap-2">
          <NotificationCards
            username="Username"
            action="Overtook you"
            type="Global"
            profileUrl="/Challenge.png"
          />
          <NotificationCards
            username="Username"
            action="Followed you"
            profileUrl="/Challenge.png"
          />
          <NotificationCards
            username="Username"
            action="Viewed your profile"
            profileUrl="/Challenge.png"
            isLast={true}
          />
          <NotificationCards
            username="Username"
            action="Overtook you"
            type="Global"
            profileUrl="/Challenge.png"
          />
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
