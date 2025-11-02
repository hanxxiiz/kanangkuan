"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/dashboard/navbar";
import Sidebar from "@/components/dashboard/sidebar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Only these routes will use the dashboard layout [just tweak if there are changes in folder structure]
  const layoutRoutes = [
    "/dashboard",
    "/dashboard/profile",
    "/dashboard/my_folders",
    "/dashboard/my_folders/my_decks",
    "/dashboard/leaderboard",
    "/dashboard/settings",
    "/dashboard/practice",
  ];

  const hasLayout = layoutRoutes.includes(pathname);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-white">
      {hasLayout && <Navbar onMenuClick={toggleSidebar} />}
      <div className={`flex ${hasLayout ? "pt-16" : ""}`}>
        {hasLayout && <Sidebar isOpen={isSidebarOpen} />}
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
    </div>
  );
};

export default DashboardLayout;
