"use client"
import React, { useEffect, useState } from "react";
import ProfileLevelBar from "./Levelbar"
import ProfileMonthlyProgress from "./ProfileMonthlyProgress"
import RecentDeck from "./RecentDeck";
import { useSupabase } from "@/components/providers/SupabaseProvider";

type FeedPanelProps = {
    userId: string;
    isOwnProfile: boolean;
    switchToDecks: () => void;
}

export default function Feed({ userId, isOwnProfile, switchToDecks}: FeedPanelProps) {

    const {supabase, isLoaded} = useSupabase();
        const [xp, setXp] = React.useState<number>(0);
        const [monthlyXPData, setMonthlyXPData] = useState<Record<string, number>>({});
    
        useEffect(() => {
            if (!isLoaded || !supabase) return;
    
        const loadStats = async () => {
          // Load XP
          const { data: xpRow } = await supabase
            .from("xp_table")
            .select("xp")
            .eq("user_id", userId)
            .single();
    
          setXp(xpRow?.xp ?? 0);
    
          // Load monthly XP
          const { data: monthlyRows } = await supabase
            .from("monthly_xp")
            .select("*")
            .eq("user_id", userId);
    
          const mapped = Object.fromEntries(
            (monthlyRows ?? []).map((row) => [row.date, row.xp])
          );
    
          setMonthlyXPData(mapped);
        };
    
        loadStats();
      }, [userId, supabase, isLoaded]);

    return (
        <div>
            {/* XP */}
                    <div className="pb-3.5">
                        <h1 className="font-main text-3xl text-gray-900 py-3.5">XP</h1>
                        <div className="py-5 w-full max-h-2xl h-40 border-1 border-black rounded-2xl">
                            <ProfileLevelBar xp={xp} />
                        </div>
                    </div>

            {/*Monthly Progress */}
                    <div className="py-3.5">
                        <h1 className="font-main text-3xl text-gray-900 py-3.5">My Progress</h1>
                        <ProfileMonthlyProgress monthlyXPData={monthlyXPData} />
                    </div>

            {/* Decks */}
                    <div className="my-3.5">
                        <div className="flex items-center justify-between">   
                            <h1 className="font-main text-3xl text-gray-900 py-3.5">Decks</h1>
                            <button className="items-self-end text-md text-gray-900 hover:underline cursor-pointer"
                                    onClick={switchToDecks}>
                                        View all</button>
                        </div>
                        <RecentDeck
                        userId={userId}
                        isOwnProfile={isOwnProfile}
                        />
                    </div>        
        </div>
    )
}