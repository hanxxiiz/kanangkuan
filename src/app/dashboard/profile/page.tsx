"use client";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import React, { useState, useEffect } from "react";
import FeedPanel from "@/components/profile/FeedPanel";
import StatsPanel from "@/components/profile/StatsPanel";
import DecksPanel from "@/components/profile/DecksPanel";
import Navbar from "@/components/profile/Navbar";
import ProfileCard from "@/components/profile/ProfileCard";
import { useRouter } from "next/navigation";
import type { Profile } from "@/utils/supabase/models";
import StylishLoader2 from "@/components/ui/StylishLoader2";


const ProfilePage = () => {
    const { supabase, session, isLoaded } = useSupabase();
    const router = useRouter();
    const [activeIndex, setActiveIndex] = useState(0);
    const [profileData, setProfileData] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    

    //fetch current user profile
     
    useEffect(() => {
      const loadProfile = async () => {
        if (!isLoaded || !supabase) return;
        
        if (!session?.user) {
          router.push('/login');
          return;
        }

        setLoading(true);

        try {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (error) {
            console.error("Error loading profile:", error);
            setProfileData(null);
          } else {
            setProfileData(profile as Profile);
          }
        } catch (error) {
          console.error("Error in loadProfile:", error);
        } finally {
          setLoading(false);
        }
      };

      loadProfile();
    }, [supabase, session, isLoaded, router]);

    const handleNavChange = (index: number) => {
      setActiveIndex(index);
    };

    if (!isLoaded || loading) {
      return (
        <StylishLoader2 />
      );
    }

    if (!profileData) {
      return (
        <div className="min-h-screen flex items-center justify-center text-xl font-main">
          Profile not found
        </div>
      );
    }
  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      {/* Main Section */}
      <section className="min-h-screen w-full transition-all duration-500 ease-in-out px-6 sm:px-12 md:px-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row my-6 mb-10 items-center justify-between max-w-full">
          <h1 className="font-main text-4xl md:text-5xl text-gray-900 mb-4 sm:mb-0">
            Profile
          </h1>
        </div>

        <ProfileCard 
        profileData={profileData}
        isOwnProfile={true}
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
              isOwnProfile={true}
              switchToDecks={() => {
              setActiveIndex(2);
              }}
            />
          )}
          {activeIndex === 1 && <StatsPanel 
            userId={profileData.id}
            isOwnProfile={true} />}
          {activeIndex === 2 && <DecksPanel
            userId={profileData.id}
            isOwnProfile={true} />}
        </section>
      </section>
    </div>
  );
};

export default ProfilePage;
