import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSupabase } from "../providers/SupabaseProvider";
import { useDashboard } from "../dashboard/DashboardContext";

type RankedCardProps = {
  username: string;
  xp: number;
  ranking: number;
  imageUrl: string | null;
  userId?: string;
};

const FALLBACK = "/dashboard/default-picture.png"; //para sa dili ma kita ang picture

const RankedCard: React.FC<RankedCardProps> = ({ username, xp, ranking, imageUrl, userId }) => {
  const { supabase, session } = useSupabase();
  const { username: currentUsername } = useDashboard();
  
  const resolveSrc = (src: string | null): string => {
    if (!src || typeof src !== "string") return FALLBACK;
    const trimmed = src.trim();
    return trimmed === "" ? FALLBACK : trimmed;
  };

  const router = useRouter();
  const handleClick = async () => {
    if(!userId){
      return;
    }
    // Fire-and-forget profile view notification
    const viewerId = session?.user?.id;
    const viewerName = currentUsername || "Someone";
    if (supabase && viewerId && viewerId !== userId) {
      const { error } = await supabase.from("notifications").insert({
        user_id: userId,
        type: "profile_view",
        message: `${viewerName} viewed your profile`,
        read: false,
      });
      if (error) {
        console.error("Failed to log profile_view notification:", error?.message ?? error);
      }
    }
    router.push(`/dashboard/profile/${userId}`);
  };
  
  return (
    <div
    onClick={handleClick}
      className="flex flex-col gap-4 rounded-3xl border border-[#CFCECE]
      bg-gradient-to-l from-white to-white
      transition-all duration-500 ease-out
      hover:from-[#FEEF69] hover:to-white
      hover:scale-105 transform hover:cursor-pointer
      drop-shadow-[0_12px_12px_rgba(0,0,0,0.25)]
      p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      {/* Left Section: Avatar + Username + XP (for mobile) */}
      <div className="flex items-center gap-4 sm:gap-6">

        {/* Rank on the right (mobile only) */}
        <p className="ml-auto block sm:hidden font-main text-2xl text-pink">
          {ranking}
        </p>

        <p className="font-main text-pink text-2xl ml-5 sm:text-4xl">{ranking}</p>
        
        <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-full overflow-hidden">
          <Image
            src={resolveSrc(imageUrl)}
            alt="/dashboard/default-picture.png"
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col">
          <p className="font-body text-2xl font-main text-gray-900 sm:text-3xl">{username}</p>
          {/* XP below username on mobile */}
          <p className="block sm:hidden font-body text-md text-gray-900">{xp} XP</p>
        </div>

        
      </div>

      {/* Right Section: XP + Rank (for desktop/tablet) */}
      <div className="hidden sm:flex items-center justify-end gap-6">
        <p className="font-body text-md text-gray-900 sm:text-xl">{xp} XP</p>
        
      </div>
    </div>
  );
};

export default RankedCard;
