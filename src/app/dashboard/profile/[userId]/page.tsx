"use client";

import React, { useState, useEffect, use } from "react";
import FeedPanel from "@/components/profile/FeedPanel";
import StatsPanel from "@/components/profile/StatsPanel";
import DecksPanel from "@/components/profile/DecksPanel";
import Navbar from "@/components/profile/Navbar";
import ProfileCard from "@/components/profile/ProfileCard";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { useRouter } from "next/navigation";

// For /profile/[userId]/page.tsx - shows other users' profiles
type DynamicProfilePageProps = {
  params: Promise<{ userId: string }>;
};

const DynamicProfilePage = ({ params }: DynamicProfilePageProps) => {
  const { userId } = React.use(params);
  const { supabase, session, isLoaded } = useSupabase();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  type Profile = Record<string, any>;
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  // Fetch profile data for the specified userId
  useEffect(() => {
    const loadProfile = async () => {
      if (!isLoaded || !supabase) return;

      setLoading(true);

      try {
        // Check if viewing own profile
        const currentUserId = session?.user?.id;
        const isOwn = currentUserId === userId;
        setIsOwnProfile(isOwn);

        // If userId is "me", redirect to /profile
        if (userId === "me") {
          router.push("/profile");
          return;
        }

        // Fetch profile data for the specified user
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Error loading profile:", error);
          setProfileData(null);
        } else {
          setProfileData(profile);
        }
      } catch (error) {
        console.error("Error in loadProfile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [supabase, session, userId, isLoaded, router]);

  const handleNavChange = (index: number) => {
    setActiveIndex(index);
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-main">
        Loading profile...
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-xl font-main">Profile not found</p>
        <button
          onClick={() => router.push("/dashboard/leaderboard")}
          className="px-6 py-2 bg-black text-white rounded-full hover:scale-105 transition-transform"
        >
          Back to Leaderboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      <section className="min-h-screen w-full transition-all duration-500 ease-in-out px-6 sm:px-12 md:px-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row my-6 mb-10 items-center justify-between max-w-full">
          
        </div>

        <ProfileCard 
          profileData={profileData} 
          isOwnProfile={isOwnProfile}
        />

        {/* Navbar */}
        <Navbar
          items={["Feed", "Stats", "Decks"]}
          activeIndex={activeIndex}
          onChange={handleNavChange}
          className="mb-8"
        />

        {/* Panel Content */}
        <section className="mt-6">
          {activeIndex === 0 && (
            <FeedPanel
              userId={profileData.id}
              isOwnProfile={isOwnProfile}
              switchToDecks={() => {
                setActiveIndex(2);
              }}
            />
          )}
          {activeIndex === 1 && (
            <StatsPanel 
              userId={profileData.id}
              isOwnProfile={isOwnProfile}
            />
          )}
          {activeIndex === 2 && (
            <DecksPanel 
              userId={profileData.id}
              isOwnProfile={isOwnProfile}
            />
          )}
        </section>
      </section>
    </div>
  );
};

export default DynamicProfilePage;