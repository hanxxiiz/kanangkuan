"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { FaFolder, FaSignOutAlt } from "react-icons/fa";
import { IoSearchOutline, IoSettingsSharp, IoPerson } from "react-icons/io5";
import { BsFillGridFill, BsBarChartFill } from "react-icons/bs";
import { FiSearch } from "react-icons/fi";
import { MdLibraryBooks } from "react-icons/md";


const Sidebar = ({ isOpen }: { isOpen: boolean }) => {
  const pathname = usePathname();
  const [clickedItem, setClickedItem] = React.useState("/dashboard");
  
  const menuItems = [
    { icon: BsFillGridFill, label: "Dashboard", href: "/dashboard", iconSize: "text-xl" },
    { icon: FaFolder, label: "My Folders", href: "/dashboard/my_folders", iconSize: "text-xl" },
    { icon: IoPerson, label: "Profile", href: "/dashboard/profile", iconSize: "text-xl" },
    { icon: BsBarChartFill, label: "Leaderboard", href: "/dashboard/leaderboard", iconSize: "text-xl" },
    { icon: IoSettingsSharp, label: "Settings", href: "/dashboard/settings", iconSize: "text-xl" },
  ];

  return (
    <>
      {/*Mobile/iPad horizontal navigation bar*/}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-black z-50">
        <div className="flex items-center justify-between py-2 px-2">
          {menuItems.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const displayLabel = item.label === "My Folders" ? "Folders" : item.label;
            const isHighlighted = clickedItem === item.href; // ONLY check clickedItem

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault(); //remove this line once the other pages are alr created
                  setClickedItem(item.href);
                }}
                className="flex flex-col items-center py-1 px-2 rounded-lg hover:bg-[#29411a] transition-all duration-200 group flex-1"
              >
                <Icon className={`text-xl mb-1 transition-colors ${
                  isHighlighted 
                    ? "text-white" 
                    : "text-gray-300"
                }`} />
                <span className={`font-regular text-xs transition-colors text-center leading-tight ${
                  isHighlighted 
                    ? "text-white" 
                    : "text-gray-300"
                }`}>
                  {displayLabel}
                </span>
              </Link>
            );
          })}
          
          {/* Practice button in the middle */}
          <Link
            href="/practice"
            onClick={(e) => {
              e.preventDefault();
              setClickedItem("/practice");
            }}
            className="flex flex-col items-center py-1 px-2 rounded-lg transition-all duration-200 group flex-1"
          >
            <MdLibraryBooks className={`text-xl mb-1 transition-colors ${
              (pathname === "/practice" || clickedItem === "/practice")
                ? "text-white" 
                : "text-gray-300"
            }`} />
            <span className={`font-regular text-xs transition-colors text-center leading-tight ${
              (pathname === "/practice" || clickedItem === "/practice")
                ? "text-white" 
                : "text-gray-300"
            }`}>
              Practice
            </span>
          </Link>
          
          {menuItems.slice(2, 4).map((item) => {
            const Icon = item.icon;
            const isHighlighted = clickedItem === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  setClickedItem(item.href);
                }}
                className="flex flex-col items-center py-1 px-2 rounded-lg hover:bg-[#29411a] transition-all duration-200 group flex-1"
              >
                <Icon className={`text-xl mb-1 transition-colors ${
                  isHighlighted 
                    ? "text-white" 
                    : "text-gray-300"
                }`} />
                <span className={`font-regular text-xs transition-colors text-center leading-tight ${
                  isHighlighted 
                    ? "text-white" 
                    : "text-gray-300"
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/*Desktop sidebar*/}
      <div
      className={`${
        isOpen ? "w-64" : "w-20"
      } hidden lg:flex h-screen bg-[#101220] text-black transition-all duration-300 flex flex-col overflow-hidden fixed left-0 top-16 z-40`}
      >
        {/* Search Pill */}
        <div className={`mx-auto mt-10 ${isOpen ? "" : "mb-0.5"}`}>
          <div className="relative h-12 flex items-center justify-center">
            {isOpen ? (
              <div className={`flex items-center transition-all duration-300 overflow-hidden ${
                isOpen ? "opacity-100 max-w-[250px]" : "opacity-0 max-w-0"
              }`}>
                <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="text"
                  placeholder="Decks / Folders"
                  className="w-54 pl-12 pr-4 py-3 rounded-full bg-[#1a1c2b] text-white text-l placeholder-gray-400 focus:outline-none transition-all duration-300"
                />
              </div>
            ) : (
              <div className="relative group w-12 h-12 flex items-center justify-center cursor-pointer">
                {/* Hover Background */}
                <span
                  className="absolute bg-lime opacity-0 group-hover:opacity-100 rounded-lg transition-all duration-300"
                  style={{
                    width: "4.05rem",   
                    height: "3.4rem", 
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)"
                  }}
                />
                {/* Icon */}
                <FiSearch
                  className="text-white group-hover:text-[#101220] transition-all duration-300 text-xl z-10"
                />
              </div>
          )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex flex-col mt-8 space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`group relative flex items-center transition-all duration-300 w-full py-3
                  ${isOpen ? "gap-6 px-8" : "justify-center px-0"}`}
              >
                {/*Accent bar*/}
                <span className={`absolute z-2 top-0 left-0 h-full w-2 bg-lime transition-all duration-300 ${
                  isOpen ? "opacity-0 group-hover:opacity-100" : "opacity-0 group-hover:opacity-0"
                }`} />
                
                {/* Full-width Hover Background */}
                <span
                  className={`absolute transition-all duration-300
                    ${isOpen
                      ? "inset-0 bg-[#29411a] opacity-0 group-hover:opacity-100"
                      : "left-2 right-2 top-0 bottom-0 bg-lime opacity-0 group-hover:opacity-100 rounded-lg"
                  }`}
                />
                {/* Icon + Label */}
                <Icon
                  className={`relative z-10 ${item.iconSize} flex-shrink-0 transition 
                    ${isOpen
                      ? "text-white group-hover:text-lime"
                      : "text-white group-hover:text-[#101220]"
                  }`}
                />
                <span 
                  className={`relative z-10 font-regular text-lg text-white group-hover:text-lime transition-all duration-300 whitespace-nowrap overflow-hidden ${
                    isOpen ? "opacity-100 max-w-[200px]" : "opacity-0 max-w-0"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          <div className={`mt-4 mx-auto transition-all duration-300 ${
            isOpen ? "opacity-100 max-w-[250px]" : "opacity-0 max-w-0"
          }`}>
            <button
              className="w-53 flex items-center justify-center py-2 bg-lime cursor-pointer text-white text-lg font-main rounded-full hover:bg-pink hover:scale-105 transition-all duration-300 whitespace-nowrap"
            >
              Practice
            </button>
          </div>
        </nav>

        {/* Bottom Section — Logout */}
        <div className="mt-15 mb-8">
          <Link
            href="/"
            className={`group relative flex items-center py-3 transition-all duration-300 w-full
              ${isOpen ? "gap-6 px-8" : "justify-center px-0"}`}
          >
            {/* Left Accent Bar */}
            <span className={`absolute z-2 top-0 left-0 h-full w-2 bg-lime transition-all duration-300 ${
              isOpen ? "opacity-0 group-hover:opacity-100" : "opacity-0 group-hover:opacity-0"
            }`}/>

            {/* Full-width Hover Background */}
            <span
              className={`absolute transition-all duration-300
                ${isOpen 
                  ? "inset-0 bg-[#29411a] opacity-0 group-hover:opacity-100"  // full-width, no rounding
                  : "left-2 right-2 top-0 bottom-0 bg-lime opacity-0 group-hover:opacity-100 rounded-lg" // smaller, rounded with gaps
                }`}
            />

            {/* Icon + Label */}
            <FaSignOutAlt
              className={`relative z-10 text-xl flex-shrink-0 transition 
                ${isOpen 
                  ? "text-white group-hover:text-lime"  // expanded: white → lime on hover
                  : "text-white group-hover:text-[#101220]" // collapsed: stays black even on hover
                }`}
            />

            <span 
              className={`relative z-10 font-regular text-lg text-white group-hover:text-lime transition-all duration-300 whitespace-nowrap overflow-hidden ${
                isOpen ? "opacity-100 max-w-[200px]" : "opacity-0 max-w-0"
              }`}
            >
              Log out
            </span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Sidebar;