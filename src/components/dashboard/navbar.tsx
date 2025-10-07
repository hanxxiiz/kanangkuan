"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { IoMenu } from "react-icons/io5";
import { IoNotificationsOutline } from "react-icons/io5";
import { RiArrowDropDownLine } from "react-icons/ri";
import "./levelbar.css";

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const level = 5;
  const progress = 60;

  return (
    <nav
      className={`fixed w-full bg-white shadow-md transition-transform duration-300`}
    >
      <div className="max-w-8xl px-1 sm:px-2 lg:px-6">
        <div className="flex justify-between h-16 items-center">
          {/* Left section: sidebar icon + logo */}
          <div className="flex flex-row items-center sm:space-x-1 lg:space-x-4">
            <button
              className="p-3 sm:p-2 rounded-md hover:cursor-pointer hover:text-[#101220] transition-all duration-200"
              onClick={() => console.log("Sidebar expand clicked!")}
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
              <h2 className="font-main text-lime text-xl sm:text-2xl hover:text-pink transition-colors whitespace-nowrap">
                Kanang Kuan
              </h2>
            </Link>
          </div>

          {/* Right section: level bar + notifications + profile */}
          <div className="flex items-center space-x-2 ml-auto sm:pl-0 sm:space-x-3 lg:space-x-8">
            <div className="hidden sm:flex items-center space-x-3">
              <span className="text-md font-body text-[#101220]">
                Level {level}
              </span>
              <div className="level-container">
                <div className="level-bar">
                  <div className="level-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="level-text text-xl font-body">{progress} XP</div>
              </div>
            </div>

            {/* Notifications */}
            <button
              className="relative rounded-full hover:cursor-pointer hover:text-[#101220] transition"
              onClick={() => console.log("Notifications clicked!")}
            >
              <IoNotificationsOutline className="text-3xl" />
            </button>

            {/* Profile + dropdown */}
            <div className="flex items-center -space-x-1 sm:space-x-0">
              <Link href="/dashboard" className="flex items-center flex-shrink-0">
                <Image
                  src="/temporary.PNG"
                  alt="Kanang Kuan"
                  width={40}
                  height={40}
                  className="rounded-full w-[2.2rem] h-[2.2rem] sm:w-[3rem] sm:h-[3rem]"
                />
              </Link>
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

          {/* Mobile dropdown (empty for now, just structure kept) */}
          <div
            className={`md:hidden transition-all duration-300 ease-in-out ${
              isMenuVisible
                ? "max-h-64 opacity-100"
                : "max-h-0 opacity-0 overflow-hidden"
            }`}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {/* Empty – add links later if needed */}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;