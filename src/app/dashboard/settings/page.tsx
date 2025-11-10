"use client";

import React, { useState } from "react";
import { Button } from "@/components/buttons/PrimaryButton";
import ChangeUsername from "@/components/settings/ChangeUsername";
import ChangePassword from "@/components/settings/ChangePassword";
import { FaCircleExclamation } from "react-icons/fa6";

const SettingsPage = () => {
  const [showChangeUsername, setShowChangeUsername] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  return (
    <div className="min-h-screen w-full bg-white px-4 sm:px-8 lg:px-16 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="font-bold text-4xl sm:text-5xl text-gray-900 mb-4 sm:mb-0">
          Settings
        </h1>
        <div className="flex justify-center sm:justify-end">
          <div className="flex hidden sm:block bg-white border border-gray-900 px-4 py-1 rounded-full text-gray-900 font-body text-sm sm:text-base">
            Settings
          </div>
        </div>
      </div>

      <div className="border border-[#CFCECE]" />

      {/* Section Title */}
      <div className="mt-8 mb-4">
        <p className="text-gray-900 text-2xl sm:text-3xl font-body">
          User Settings
        </p>
      </div>

     {/* Profile Card */}
<section className="border-2 rounded-2xl border-[#CFCECE] overflow-hidden">
  <div className="relative w-full h-auto sm:h-70">
    {/* Gradient Background */}
    <div
      className="absolute inset-0 h-50 sm:h-50 w-full rounded-2xl"
      style={{
        background: "linear-gradient(80deg, #8AFF00 0%, #00FFD1 44%, #00FFD1 100%)",
      }}
    ></div>

    {/* Desktop Layout */}
    <div className="hidden sm:flex relative items-start h-70 w-full">
      {/* Profile Image */}
      <img
        src="mascot-hero.svg"
        className="absolute bottom-0 m-10 max-w-xs max-h-xs w-50 h-50 rounded-full bg-gray-900 z-10"
      />
      {/* User Info */}
      <div className="relative flex flex-col left-70 top-10">
        <p className="text-gray-900 text-4xl font-bold font-main">[Username]</p>
        <p className="text-gray-900 text-2xl font-body my-2">[Name]</p>
        <div className="flex items-center">
          <p className="text-gray-800 text-md font-body">0 Following</p>
          <div className="w-1 h-1 bg-gray-900 rounded-full m-3"></div>
          <p className="text-gray-900 text-md font-body">0 Followers</p>
        </div>
      </div>
    </div>

    {/* Mobile Layout */}
    <div className="flex flex-col sm:hidden relative items-center pt-8 pb-4 text-center">
      <p className="text-gray-900 text-3xl font-bold font-main">[Username]</p>
      <p className="text-gray-900 text-xl font-body my-1">[Name]</p>
      <div className="flex items-center justify-center mt-2">
        <p className="text-gray-800 text-sm font-body">0 Following</p>
        <div className="w-1 h-1 bg-gray-900 rounded-full mx-2"></div>
        <p className="text-gray-900 text-sm font-body">0 Followers</p>
      </div>
      {/* Image below the info */}
      <img
        src="mascot-hero.svg"
        className="mt-6 w-32 h-32 rounded-full bg-gray-900 z-10"
      />
    </div>
  </div>

  {/* Email Section */}
  <div className="flex flex-col sm:flex-row m-6 sm:m-10 justify-between items-start sm:items-end gap-4">
    <div className="flex flex-col w-full sm:w-1/2">
      <p className="text-black text-lg sm:text-xl font-body mx-2 sm:mx-10 my-3">Email</p>
      <div>
        <p className="text-black text-base sm:text-xl font-body px-2 sm:px-10">
          [User's Email Address]
        </p>
        <div className="border border-[#CFCECE] mt-2 sm:mt-0" />
      </div>
    </div>
    <div className="flex flex-row gap-2 items-center sm:items-end justify-start sm:justify-end w-full">
      <div className="w-4 h-4 sm:w-5 sm:h-5">
        <FaCircleExclamation color="black" />
      </div>
      <p className="text-black text-sm sm:text-base font-body">
        the email cannot be changed
      </p>
    </div>
  </div>
</section>



      {/* Change Username */}
      <div className="flex flex-col sm:flex-row py-10 sm:py-20 items-start sm:items-end gap-4 sm:gap-0">
        <div className="flex flex-col w-full sm:w-1/2">
          <p className="text-black text-lg sm:text-xl font-body mx-2 sm:mx-10 mb-4 sm:mb-8">
            Username
          </p>
          <p className="text-black text-base sm:text-xl font-body px-2 sm:px-10">
            [Current Username]
          </p>
          <div className="border border-[#CFCECE] mt-1" />
        </div>
        <div className="flex justify-end w-full sm:w-1/2 px-2 sm:pl-10">
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
      <div className="flex flex-col sm:flex-row py-10 sm:py-20 items-start sm:items-end gap-4 sm:gap-0">
        <div className="flex flex-col w-full sm:w-1/2">
          <p className="text-black text-lg sm:text-xl font-body mx-2 sm:mx-10 mb-4 sm:mb-8">
            Password
          </p>
          <p className="text-black text-base sm:text-xl font-body px-2 sm:px-10">
            [Current Password]
          </p>
          <div className="border border-[#CFCECE] mt-1" />
        </div>
        <div className="flex justify-end w-full sm:w-1/2 px-2 sm:pl-10">
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
