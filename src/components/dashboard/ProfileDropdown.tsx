"use client";

import Link from "next/link";
import { FaUser, FaSignOutAlt } from "react-icons/fa"; 
import { IoSettingsSharp } from "react-icons/io5";
import { signout } from "@/lib/auth-actions";

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileDropdown = ({ isOpen, onClose }: ProfileDropdownProps) => {
  const handleSignOut = async () => {
    onClose();
    await signout();
  };

  return (
    <>
      <div 
        className={`fixed inset-0 z-40 transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      
      <div className={`fixed top-17 right-3 sm:right-8 lg:right-12 bg-white border border-gray-200 rounded-lg shadow-lg w-56 py-2 z-50 transition-all duration-200 origin-top-right ${
        isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
      }`}>
        <h3 className="text-md font-main px-5 py-2 text-gray-800">My Account</h3>
        <ul>
          <li className="border-b border-gray-100">
            <Link 
              href="/dashboard/profile"
              className="flex items-center space-x-3 px-5 py-3 hover:bg-gray-100 cursor-pointer text-gray-800 text-md transition-colors"
              onClick={onClose}
            >
              <FaUser className="text-md" />
              <span>Profile</span>
            </Link>
          </li>
          
          <li className="border-b border-gray-100">
            <Link 
              href="/dashboard/settings"
              className="flex items-center space-x-3 px-5 py-3 hover:bg-gray-100 cursor-pointer text-gray-800 text-md transition-colors"
              onClick={onClose}
            >
              <IoSettingsSharp className="text-md" />
              <span>Settings</span>
            </Link>
          </li>
          
          <li>
            <button 
              className="flex items-center space-x-3 px-5 py-3 hover:bg-gray-100 cursor-pointer text-gray-800 text-md transition-colors text-left w-full"
              onClick={handleSignOut}
            >
              <FaSignOutAlt className="text-md" />
              <span>Log out</span>
            </button>
          </li>
        </ul>
      </div>
    </>
  );
};

export default ProfileDropdown;