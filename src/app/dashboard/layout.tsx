"use client";

import React, { useState } from 'react'
import Navbar from '@/components/dashboard/navbar'
import Sidebar from '@/components/dashboard/sidebar'

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar onMenuClick={toggleSidebar} />
      <div className="flex pt-16">
        <Sidebar isOpen={isSidebarOpen} />
        <main className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? 'ml-64' : 'ml-20'
        }`}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout