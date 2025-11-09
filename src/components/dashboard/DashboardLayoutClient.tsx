"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/dashboard/navbar";
import Sidebar from "@/components/dashboard/sidebar";
import ModalProvider from "@/components/modals/providers";
import ProfileDropdown from "@/components/dashboard/ProfileDropdown";
import SearchModal from "./SearchModal";
import { useDashboard } from "@/components/dashboard/DashboardContext";

const DashboardLayoutClient = ({ children }: { children: React.ReactNode }) => {
  const { allDecks, folders } = useDashboard(); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchMode, setSearchMode] = useState<"search" | "practice">("search"); // Track the mode

  const pathname = usePathname();

  // Show layout for all /dashboard routes EXCEPT those starting with /practice/
  const dynamicRoutes = [
    "/dashboard/my-decks/folder/",
    "/dashboard/my-decks/",
  ];

  const hasLayout =
    pathname.startsWith("/dashboard") &&
    !pathname.startsWith("/practice/") ||
    dynamicRoutes.some(route => pathname.startsWith(route));
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSearchClick = () => {
    setSearchMode("search");
    setShowSearchModal(true);
  };

  const handlePracticeClick = () => {
    setSearchMode("practice");
    setShowSearchModal(true);
  };


  return (
    <ModalProvider>
      <div className="min-h-screen bg-white">
        {hasLayout && (
          <>
            <Navbar 
              onMenuClick={toggleSidebar}
              isDropdownOpen={isDropdownOpen}
              onDropdownToggle={() => setIsDropdownOpen(!isDropdownOpen)}
              onSearchClick={handleSearchClick}
            />
            <ProfileDropdown 
              isOpen={isDropdownOpen} 
              onClose={() => setIsDropdownOpen(false)} 
            />
          </>
        )}
        <div className={`flex ${hasLayout ? "pt-16" : ""}`}>
          {hasLayout && (
            <Sidebar 
              isOpen={isSidebarOpen} 
              onSearchClick={handleSearchClick} 
              onPracticeClick={handlePracticeClick}  
            />
          )}
          <main
            className={`flex-1 transition-all duration-300 ${
              hasLayout
                ? isSidebarOpen
                  ? "lg:ml-64"
                  : "lg:ml-20"
                : ""
            }`}
          >
            <div className="p-6 pb-20 lg:pb-6">{children}</div>
          </main>
        </div>
        <SearchModal 
          showModal={showSearchModal} 
          setShowModal={setShowSearchModal}
          mode={searchMode}
          allDecks={allDecks}
          folders={folders}
        />
      </div>
    </ModalProvider>
  );
};

export default DashboardLayoutClient;
