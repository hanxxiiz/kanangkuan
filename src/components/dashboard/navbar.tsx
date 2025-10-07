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
      <div className="max-w-8xl px-4  sm:px-6 lg:px-6">
        <div className="flex justify-between h-16 items-center">
          {/* Left section: sidebar icon + logo */}
          <div className="flex flex-row items-center space-x-4">
            <button
              className="p-2 rounded-md hover:cursor-pointer hover:text-[#101220] transition-all duration-200"
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
                className="w-[3.5rem] h-[3.5rem]"
              />
              <h2 className="font-main text-lime text-2xl hover:text-pink transition-colors">
                Kanang Kuan
              </h2>
            </Link>
          </div>

          {/* Right section: level bar + notifications + profile */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <span className="text-md font-main text-[#101220]">
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
            <div className="flex items-center space-x-1">
              <Link href="/dashboard" className="flex items-center">
                <Image
                  src="/temporary.PNG"
                  alt="Kanang Kuan"
                  width={40}
                  height={40}
                  className="rounded-full w-[3rem] h-[3rem]"
                />
              </Link>
              <button
                className="relative rounded-full hover:cursor-pointer hover:text-[#101220] transition"
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