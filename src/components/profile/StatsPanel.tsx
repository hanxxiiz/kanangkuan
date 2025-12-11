"use client"
import { useEffect, useState } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import LevelBar from "./Levelbar";
import MonthlyProgress from "./ProfileMonthlyProgress";

type StatsPanelProps = {
    userId: string;
    isOwnProfile: boolean;
};

export default function StatsPanel({ userId, isOwnProfile }: StatsPanelProps) {
    const { supabase } = useSupabase();
    const [userXP, setUserXP] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    // Fetch user's XP
    useEffect(() => {
        const fetchUserXP = async () => {
            if (!userId || !supabase) return;

            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("xp")
                    .eq("id", userId)
                    .single();

                if (error) {
                    console.error("Error fetching user XP:", error);
                } else {
                    setUserXP(data?.xp || 0);
                }
            } catch (error) {
                console.error("Error in fetchUserXP:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserXP();
    }, [userId, supabase]);

    return (
        <div>
            {/* XP */}
            <div className="pb-3.5">
                <h1 className="font-main text-3xl text-gray-900 py-3.5">XP</h1>
                <div className="py-5 w-full max-h-2xl h-40 border-1 border-black rounded-2xl">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">Loading...</p>
                        </div>
                    ) : (
                        <LevelBar xp={userXP} />
                    )}
                </div>
            </div>
                    
            {/* My Progress */}
            <div className="py-3.5">
                <h1 className="font-main text-3xl text-gray-900 py-3.5">
                    {isOwnProfile ? "My Progress" : "Progress"}
                </h1>
                <MonthlyProgress userId={userId} />
            </div>
        </div>
    )
}