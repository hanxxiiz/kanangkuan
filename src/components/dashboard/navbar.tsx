"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { IoMenu } from "react-icons/io5";
import { IoNotificationsOutline } from "react-icons/io5";
import { RiArrowDropDownLine } from "react-icons/ri";
import { IoSearchOutline } from "react-icons/io5";
import LevelBar from "./levelBar";

const Navbar = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const notificationCount = 5;

  return (
    <nav
      className={`fixed top-0 left-0 w-full bg-white shadow-md transition-transform duration-300 z-50`}
    >
      <div className="max-w-8xl mx-auto px-3 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-16">
          {/* Left section: sidebar icon + logo */}
          <div className="flex flex-row items-center space-x-2 sm:space-x-4 lg:space-x-6">
            <button
              className="hidden lg:block p-3 sm:p-2 rounded-md hover:cursor-pointer hover:text-[#101220] transition-all duration-200"
              onClick={onMenuClick} 
            >
              <IoMenu className="text-2xl" />
            </button>

            <Link href="/dashboard" className="flex items-center space-x-2">
              <Image
                src="kanangkuan-logo.svg"
                alt="Kanang Kuan"
                width={56}
                height={56}
                className="w-[2.5rem] h-[2.5rem] sm:w-[3.5rem] sm:h-[3.5rem]"
              />
              <h2 className="font-main text-lime text-xl sm:text-2xl hover:text-purple mr-12 sm:mr-0 transition-colors whitespace-nowrap">
                Kanang Kuan
              </h2>
            </Link>
          </div>

          {/* Right section: level bar + notifications + profile */}
          <div className="flex items-center space-x-3 sm:space-x-5 lg:space-x-10">
            <div className="hidden lg:flex items-center justify-center space-x-3 h-16">
              <LevelBar />
            </div>


            {/* Search icon - visible only on mobile */}
            <button
              className="lg:hidden relative rounded-full hover:cursor-pointer text-[#101220] transition"
              onClick={() => console.log("Search clicked!")}
            >
              <IoSearchOutline className="text-3xl" />
            </button>

            {/* Notifications */}
            <button
              className="relative rounded-full hover:cursor-pointer hover:scale-105 text-[#101220] transition group"
              onClick={() => console.log("Notifications clicked!")}
            >
              <IoNotificationsOutline className="text-3xl" />
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 text-white text-xs bg-red-500 rounded-full w-5 h-5 flex items-center justify-center font-regular transition-colors group-hover:scale-105">
                {notificationCount}
              </span>
            </button>

            {/* Profile + dropdown */}
            <div className="flex items-center -space-x-1 sm:space-x-0">
              <div className="flex items-center flex-shrink-0">
                <Image
                  src="/temporary.PNG"
                  alt="Kanang Kuan"
                  width={40}
                  height={40}
                  className="rounded-full w-[2.2rem] h-[2.2rem] sm:w-[3rem] sm:h-[3rem] hover:cursor-pointer"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                />
              </div>
              <button
                className="relative rounded-full hover:cursor-pointer hover:text-[#101220] transition flex-shrink-0"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <RiArrowDropDownLine
                  className={`text-3xl transform transition-transform duration-300 ${
                    isDropdownOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>
            </div>
          </div>         
        </div>
      </div>
    </nav>
  );
};

export default Navbar;