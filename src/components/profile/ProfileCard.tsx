"use client";
import { useEffect, useState } from "react";
import { useDashboard } from "../dashboard/DashboardContext";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/SupabaseProvider";

type ProfileCardProps = {
  profileData?: Record<string, any>;
  isOwnProfile?: boolean;
};

const ProfileCard = ({profileData, isOwnProfile}: ProfileCardProps) => {
    const router = useRouter();
    const { supabase, session } = useSupabase();
    const pathname = usePathname();
    const { username: currentUsername } = useDashboard();
    const displayUsername = profileData?.username || currentUsername || "username";
    const displayProfileUrl = profileData?.profile_url || "/dashboard/default-picture.png";
    const profileImageSrc = (displayProfileUrl || "").trim() || "/dashboard/default-picture.png";
    const profileId = profileData?.id;
    //follow button
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [followersCount, setFollowersCount] = useState<number>(profileData?.followers_count ?? 0);
    const [followingCount, setFollowingCount] = useState<number>(profileData?.following_count ?? 0);
    // Show follow button only when viewing other users' profiles
    // AND when on /profile/[userId] route (not /dashboard/profile)
    const showFollowButton = !isOwnProfile && pathname.startsWith("/dashboard/profile/");

    // Sync counts if provided from profileData
    useEffect(() => {
      setFollowersCount(profileData?.followers_count ?? 0);
      setFollowingCount(profileData?.following_count ?? 0);
    }, [profileData?.followers_count, profileData?.following_count]);

    // Load follow state and counts
    useEffect(() => {
      const loadFollowState = async () => {
        if (!supabase || !profileId) return;

        const [{ count: followersCnt }, { count: followingCnt }] = await Promise.all([
          supabase
            .from("followers")
            .select("id", { count: "exact", head: true })
            .eq("following_id", profileId),
          supabase
            .from("followers")
            .select("id", { count: "exact", head: true })
            .eq("follower_id", profileId),
        ]);

        setFollowersCount(followersCnt ?? 0);
        setFollowingCount(followingCnt ?? 0);

        const currentUserId = session?.user?.id;
        if (!currentUserId || currentUserId === profileId) {
          setIsFollowing(false);
          return;
        }

        const { data, error } = await supabase
          .from("followers")
          .select("id")
          .eq("follower_id", currentUserId)
          .eq("following_id", profileId)
          .limit(1);

        if (error) {
          console.error("Error checking follow state:", error);
          return;
        }

        setIsFollowing((data?.length ?? 0) > 0);
      };

      loadFollowState();
    }, [supabase, session?.user?.id, profileId]);

    const handleFollowClick = async () => {
      if (!profileId) return;
      const currentUserId = session?.user?.id;
      if (!currentUserId) {
        router.push("/auth/signin");
        return;
      }
      if (currentUserId === profileId) return;
      if (!supabase) return;

      setIsLoading(true);
      try {
        if (isFollowing) {
          const { error } = await supabase
            .from("followers")
            .delete()
            .eq("follower_id", currentUserId)
            .eq("following_id", profileId);
          if (error) throw error;
          setIsFollowing(false);
          setFollowersCount((c) => Math.max(0, c - 1));
        } else {
          const { error } = await supabase
            .from("followers")
            .insert({
              follower_id: currentUserId,
              following_id: profileId,
            });
          if (error) throw error;
          setIsFollowing(true);
          setFollowersCount((c) => c + 1);
          // Notify the followed user
          const followerName = currentUsername || "Someone";
          await supabase.from("notifications").insert({
            user_id: profileId,
            type: "follow",
            message: `${followerName} followed you`,
            read: false,
          });
        }
      } catch (error) {
        console.error("Error following/unfollowing:", error);
      } finally {
        setIsLoading(false);
      }
    };

    return (
        <div>
            {/* Profile Card */}
        <section className=" rounded-2xl overflow-hidden">
          <div className="relative w-full h-auto sm:h-70">
            {/* Gradient Background */}
            <div
              className="absolute inset-0 h-50 sm:h-50 w-full rounded-2xl"
              style={{
                background:
                  "linear-gradient(80deg, #8AFF00 0%, #00FFD1 44%, #00FFD1 100%)",
              }}
            ></div>

            {/* Desktop Layout */}
            <div className="hidden sm:flex relative items-start h-70 w-full">
              {/* Profile Image */}
              <div className="absolute bottom-0 m-10 w-50 h-50 rounded-full bg-gray-900 z-10 border-5 border-white overflow-hidden">
                <Image
                  alt={displayUsername}
                  src={profileImageSrc}
                  fill
                  sizes="200px"
                  className="object-cover"
                  priority
                />
              </div>
              {/* User Info */}
              <div className="relative flex flex-col left-70 top-15">
                <p className="text-gray-900 text-4xl font-bold font-main">
                  {displayUsername}
                </p>
                {/*<p className="text-gray-900 text-2xl font-body my-2">[Name]</p> */}
                <div className="flex items-center">
                  <p className="text-gray-800 text-md font-body">{followingCount} Following</p>
                  <div className="w-1 h-1 bg-gray-900 rounded-full m-3"></div>
                  <p className="text-gray-900 text-md font-body">{followersCount} Followers</p>
                </div>
                {showFollowButton && (
                    <button
                      onClick={handleFollowClick}
                      disabled={isLoading}
                      className={`
                        text-black text-md font-body rounded-xl p-2 my-2 w-1/2 text-center
                        bg-cyan outline outline-blue outline-2 outline-offset-2
                        hover:cursor-pointer transition-all duration-200
                        ${isFollowing ? "bg-pink text-black" : ""}
                        ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                      `}
                    >
                      {isLoading ? "..." : isFollowing ? "Following" : "Follow"}
                  </button>
                  )}
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="flex flex-col sm:hidden relative items-center pt-8 pb-4 text-center">
              <p className="text-gray-900 text-3xl font-bold font-main">
                {displayUsername}
              </p>
              <p className="text-gray-900 text-xl font-body my-1">[Name]</p>
              <div className="flex items-center justify-center mt-2">
                <p className="text-gray-800 text-sm font-body">{followingCount} Following</p>
                <div className="w-1 h-1 bg-gray-900 rounded-full mx-2"></div>
                <p className="text-gray-900 text-sm font-body">{followersCount} Followers</p>
              </div>
              {showFollowButton && (
                    <button
                      onClick={handleFollowClick}
                      disabled={isLoading}
                      className={`
                        text-black text-md font-body rounded-xl p-2 my-2 w-1/2 text-center
                        bg-cyan outline outline-blue outline-2 outline-offset-2
                        hover:cursor-pointer transition-all duration-200
                        ${isFollowing ? "bg-pink text-black" : ""}
                        ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                      `}
                    >
                      {isLoading ? "..." : isFollowing ? "Following" : "Follow"}
                  </button>
                  )}
              {/* Image below the info */}
              <div className="mt-6 w-32 h-32 rounded-full bg-gray-900 z-10 overflow-hidden">
                <Image
                  alt={displayUsername}
                  src={profileImageSrc}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>
        </div>
    )
}

export default ProfileCard