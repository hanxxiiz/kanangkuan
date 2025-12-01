"use client";

import React, { useState } from "react";
import { Button } from "@/components/buttons/PrimaryButton";
import ChangeUsername from "@/components/settings/ChangeUsername";
import ChangePassword from "@/components/settings/ChangePassword";
import { FaCircleExclamation } from "react-icons/fa6";
import ProfileCard from "@/components/profile/ProfileCard";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { useDashboard } from "@/components/dashboard/DashboardContext";

const SettingsPage = () => {
  const [showChangeUsername, setShowChangeUsername] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const { session } = useSupabase();
  const email = session?.user?.email ?? "Unknown";
  
  const { username } = useDashboard();

  return (
    <div className="min-h-screen w-full bg-white px-4 sm:px-8 lg:px-16 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="font-main text-4xl sm:text-5xl text-gray-900 mb-4 sm:mb-0">
          Settings
        </h1>
      </div>

      <div className="border border-[#CFCECE]" />

     {/* Profile Card */}
      <section className="border-2 rounded-2xl border-[#CFCECE] my-10 overflow-hidden">
        <ProfileCard/>

        {/* Email Section */}
        <div className="flex flex-col sm:flex-row mb-6 mx-6 sm:mb-10 sm:mx-10 justify-between items-start sm:items-end gap-4">
          <div className="flex flex-col w-full sm:w-1/2">
            <p className="text-black font-main text-lg sm:text-xl font-body mr-2 sm:mr-10 my-3">Email</p>
            <p className="text-black text-body sm:text-xl font-body pr-2 sm:pr-10">
              {email}
            </p>
            <div className="border border-[#CFCECE] mt-2 sm:mt-0" />
          </div>
          <div className="flex flex-row gap-2 items-center sm:items-end justify-start sm:justify-end w-full">
            <div className="w-4 h-4 sm:w-5 sm:h-5">
              <FaCircleExclamation color="black" />
            </div>
            <p className="text-black text-sm sm:text-base font-body">
              The email cannot be changed.
            </p>
          </div>
        </div>
      </section>

      {/* Change Username */}
      <div className="flex flex-col sm:flex-row items-start my-10 sm:items-end gap-4 sm:gap-0">
        <div className="flex flex-col w-full sm:w-1/2 ml-10">
          <p className="text-black text-lg sm:text-xl font-main mr-2 sm:mr-10 mb-4 sm:mb-8">
            Username
          </p>
          <p className="text-black text-base sm:text-xl font-body pr-2 sm:pr-10">
            {username}
          </p>
          <div className="border border-[#CFCECE] mt-1" />
        </div>
        <div className="flex justify-end w-full sm:w-1/2 px-2 sm:pl-10 mr-10">
          <Button
            variant="flat"
            size="lg"
            className="w-full h-12 sm:w-auto sm:h-15"
            onClick={() => setShowChangeUsername(true)}
          >
            Change Username
          </Button>
        </div>
      </div>

      {/* Change Password */}
      <div className="flex flex-col sm:flex-row items-start my-10 sm:items-end gap-4 sm:gap-0">
        <div className="flex flex-col w-full ml-10 sm:w-1/2">
          <p className="text-black font-main text-lg sm:text-xl font-body mr-2 sm:mr-10 mb-4 sm:mb-8">
            Password
          </p>
          <p className="tracking-widest select-none text-black pr-2 sm:pr-10">••••••••••••••••••</p>
          <div className="border border-[#CFCECE] mt-1" />
        </div>
        <div className="flex justify-end w-full sm:w-1/2 px-2 sm:pl-10 mr-10">
          <Button
            variant="flat"
            size="lg"
            className="w-full h-12 sm:w-auto sm:h-15"
            onClick={() => setShowChangePassword(true)}
          >
            Change Password
          </Button>
        </div>
      </div>

      {/* Modals */}
      {showChangeUsername && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <ChangeUsername onClose={() => setShowChangeUsername(false)} />
        </div>
      )}

      {showChangePassword && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <ChangePassword onClose={() => setShowChangePassword(false)} />
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
