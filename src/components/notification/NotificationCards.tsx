"use client";
import { useState } from "react";
import { FaCheck } from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";
import Image from "next/image";

interface NotificationCardsProps {
  username: string;
  action: string; // e.g., "Overtook you on the leaderboard"
  type?: "Global" | "Friends"; // optional
  profileUrl: string; // profile picture URL
  isLast?: boolean; // for rounded bottom border
}

export default function NotificationCards({
  username,
  action,
  type,
  profileUrl,
}: NotificationCardsProps) {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div
      className={`flex flex-row items-center justify-between border-black border-b h-14 gap-4 px-4 sm:px-10 `}
    >
      <div className="flex flex-row gap-4 items-center">
        {/* Checkbox button */}
        <button
          onClick={() => setIsChecked((prev) => !prev)}
          className={`border border-black rounded-sm h-6 w-6 flex items-center justify-center transition-colors duration-200 ${
            isChecked ? "bg-black" : "bg-white"
          }`}
        >
          {isChecked && <FaCheck className="text-white text-sm" />}
        </button>

        {/* Profile picture */}
        <div className="relative h-6 w-6 rounded-full overflow-hidden flex-shrink-0">
          <Image
            src={profileUrl}
            alt={username}
            fill
            className="object-cover"
          />
        </div>

        {/* Notification text */}
        <h1 className="text-black font-body text-md truncate">
          {username} {action} {type ? `on the ${type} leaderboard` : ""}
        </h1>
      </div>

      {/* Hover icons */}
      <button className="relative group">
        <FaCheck
          className={`text-black transition-opacity duration-300 opacity-100 group-hover:opacity-0`}
        />
        <FaCircleCheck
          className="text-black absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
        />
      </button>
    </div>
  );
}
