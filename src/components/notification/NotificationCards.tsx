"use client";
import { FaCheck } from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";
import Image from "next/image";

interface NotificationCardsProps {
  id: number;
  username: string;
  action: string;
  type?: "Global" | "Friends";
  profileUrl: string;
  isRead: boolean;
  showCheckbox: boolean;
  isChecked: boolean;
  onToggleSelect: (id: number, checked: boolean) => void;
  onMarkAsRead: (id: number) => void;
}

export default function NotificationCards({
  id,
  username,
  action,
  type,
  profileUrl,
  isRead,
  showCheckbox,
  isChecked,
  onToggleSelect,
  onMarkAsRead,
}: NotificationCardsProps) {
  return (
    <div
      className={`flex flex-row items-center justify-between border-black border-b h-14 gap-4 px-4 sm:px-10 ${
        !isRead ? "bg-blue-50" : "bg-white"
      } transition-colors`}
    >
      <div className="flex flex-row gap-4 items-center">
        {showCheckbox && (
          <button
            onClick={() => onToggleSelect(id, !isChecked)}
            className={`border border-black rounded-sm h-6 w-6 flex items-center justify-center transition-colors duration-200 ${
              isChecked ? "bg-black" : "bg-white"
            }`}
          >
            {isChecked && <FaCheck className="text-white text-sm" />}
          </button>
        )}

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

      {/* Mark as read */}
      <button
        onClick={() => onMarkAsRead(id)}
        className="relative group"
        title={isRead ? "Already read" : "Mark as read"}
      >
        {isRead ? (
          <FaCircleCheck className="text-green-500" />
        ) : (
          <>
            <FaCheck className="text-black transition-opacity duration-300 opacity-100 group-hover:opacity-0" />
            <FaCircleCheck className="text-black absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
          </>
        )}
      </button>
    </div>
  );
}
