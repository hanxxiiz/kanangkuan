"use client"
import { useEffect, useState } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import ProfileLevelBar from "./Levelbar"
import ProfileMonthlyProgress from "./ProfileMonthlyProgress"
import RecentDeck from "./RecentDeck";
import StylishLoader2 from "../ui/StylishLoader2";

type FeedPanelProps = {
    userId: string;
    isOwnProfile: boolean;
    switchToDecks: () => void;
}

export default function Feed({ userId, isOwnProfile, switchToDecks }: FeedPanelProps) {
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
                        <StylishLoader2 />
                    ) : (
                        <ProfileLevelBar xp={userXP} />
                    )}
                </div>
            </div>

            {/*Monthly Progress */}
            <div className="py-3.5">
                <h1 className="font-main text-3xl text-gray-900 py-3.5">
                    {isOwnProfile ? "My Progress" : "Progress"}
                </h1>
                <ProfileMonthlyProgress userId={userId} />
            </div>

            {/* Decks */}
            <div className="my-3.5">
                <div className="flex items-center justify-between">   
                    <h1 className="font-main text-3xl text-gray-900 py-3.5">Decks</h1>
                    <button 
                        className="items-self-end text-md text-gray-900 hover:underline cursor-pointer"
                        onClick={switchToDecks}
                    >
                        View all
                    </button>
                </div>
                <RecentDeck userId={userId} />
            </div>        
        </div>
    )
}