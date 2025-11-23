"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/dashboard/navbar";
import Sidebar from "@/components/dashboard/sidebar";
import ModalProvider from "@/components/modals/providers";
import ProfileDropdown from "@/components/dashboard/ProfileDropdown";
import SearchModal from "./SearchModal";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import PracticeModal from "./my-decks/PracticeModal";

const DashboardLayoutClient = ({ children }: { children: React.ReactNode }) => {
  const { allDecks, folders } = useDashboard(); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchMode, setSearchMode] = useState<"search" | "practice">("search");
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [modalKey, setModalKey] = useState(0);

  const pathname = usePathname();

  const hasLayout = 
    pathname.startsWith("/dashboard") && 
    !pathname.startsWith("/dashboard/practice/");
  
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

  const handleDeckSelect = (deckId: string) => {
    setSelectedDeckId(deckId);
    setModalKey(prev => prev + 1);
    setShowSearchModal(false);
  };

  const handlePracticeModalClose = () => {
    setSelectedDeckId(null); 
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
          onDeckSelect={handleDeckSelect} 
        />

        {selectedDeckId && (
          <PracticeModal 
            key={modalKey}
            currentDeckId={selectedDeckId}
            onClose={handlePracticeModalClose} 
          />
        )}
      </div>
    </ModalProvider>
  );
};

export default DashboardLayoutClient;