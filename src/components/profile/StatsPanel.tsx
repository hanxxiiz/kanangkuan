"use client"
import React, { useState, useEffect } from "react";
import LevelBar from "./Levelbar";
import MonthlyProgress from "./ProfileMonthlyProgress";
import { useSupabase } from "@/components/providers/SupabaseProvider";

type StatsPanelProps = {
    userId?: string;
    isOwnProfile?: boolean;
}

export default function StatsPanel({ userId, isOwnProfile }: StatsPanelProps) {
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
                        <LevelBar xp={xp} />
                </div>
            </div>
                    

            {/* My Progress */}
            <div className="py-3.5">
                <h1 className="font-main text-3xl text-gray-900 py-3.5">My Progress</h1>
                <MonthlyProgress monthlyXPData={monthlyXPData} />
            </div>
        </div>
    )
}
