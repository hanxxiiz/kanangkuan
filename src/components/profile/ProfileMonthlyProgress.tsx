import React, { useEffect, useState } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import Image from "next/image";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

type ProfileMonthlyProgressProps = {
  userId: string;
};

export default function ProfileMonthlyProgress({ userId }: ProfileMonthlyProgressProps) {
  const { supabase } = useSupabase();
  const [monthlyXPData, setMonthlyXPData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Fetch user's monthly XP data
  useEffect(() => {
    const fetchMonthlyXP = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      if (!supabase) {
        setLoading(true);
        return;
      }

      setLoading(true);
      try {
        // Fetch the user's daily XP records
        // Adjust table name and columns based on your schema
        const { data, error } = await supabase
          .from("xp_transactions") // or whatever your table is called
          .select("created_at, amount")
          .eq("user_id", userId);

        if (error) {
          console.error("Error fetching monthly XP:", error);
          return;
        }

        // Convert array to object with date (YYYY-MM-DD) as key
        const xpMap: Record<string, number> = {};
        data?.forEach((record) => {
          const dateKey = new Date(record.created_at).toISOString().slice(0, 10);
          xpMap[dateKey] = (xpMap[dateKey] ?? 0) + (record.amount ?? 0);
        });

        setMonthlyXPData(xpMap);
      } catch (error) {
        console.error("Error in fetchMonthlyXP:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyXP();
  }, [userId, supabase]);

  const date = null;
  
  const rows = 5;
  const today = date || new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();

  const getBadgeIcon = (xp: number) => {
    if (xp >= 1000) return "/dashboard/badge_3.png";
    if (xp >= 800) return "/dashboard/badge_2.png";
    if (xp >= 500) return "/dashboard/badge_1.png";
    return null;
  };

  const isToday = (rowIndex: number, colIndex: number) => {
    const dayOfMonth = today.getDate();
    
    let todayGridPosition = firstDayOfMonth + dayOfMonth - 1;
    todayGridPosition = todayGridPosition % (rows * 7); 
    
    const currentCellPosition = rowIndex * 7 + colIndex;
    
    return currentCellPosition === todayGridPosition;
  };

  const getXPForDay = (rowIndex: number, colIndex: number) => {
    const currentCellPosition = rowIndex * 7 + colIndex;
    const totalCells = rows * 7; 
    const todayDayNumber = today.getDate();
    
    let dayNumber = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const dayPosition = (firstDayOfMonth + day - 1) % totalCells;
      if (dayPosition === currentCellPosition) {
        dayNumber = day;
        break;
      }
    }
    
    if (dayNumber < 1 || dayNumber > daysInMonth) return 0;
    
    if (dayNumber === todayDayNumber) return 0;
    
    const oldestVisibleDay = Math.max(1, todayDayNumber - totalCells + 1);
    
    if (dayNumber < oldestVisibleDay || dayNumber >= todayDayNumber) {
      return 0;
    }
    
    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
    return monthlyXPData[dateKey] || 0;
  };

  if (loading) {
    return (
      <div className="w-full h-full">
        <div className="mx-auto w-full h-full rounded-3xl bg-[#10FFE2] px-6 pt-6 pb-12 min-h-[200px] shadow-[0px_8px_28px_-9px_rgba(0,0,0,0.45)] flex items-center justify-center">
          <p className="text-black font-main">Loading progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="mx-auto w-full h-full rounded-3xl bg-[#10FFE2] px-6 pt-6 pb-12 min-h-[200px] shadow-[0px_8px_28px_-9px_rgba(0,0,0,0.45)]">
        
        <div className="mt-4 grid grid-cols-7 gap-x-4 sm:gap-x-6 text-black">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-center text-base sm:text-lg font-regular">
              {day}
            </div>
          ))}
        </div>

        <div className="mt-3 grid grid-rows-5 gap-y-4 sm:gap-y-5">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid grid-cols-7 place-items-center gap-x-4 sm:gap-x-6"
            >
              {daysOfWeek.map((_, colIndex) => {
                const xp = getXPForDay(rowIndex, colIndex);
                const badge = getBadgeIcon(xp);
                const today = isToday(rowIndex, colIndex);
                
                const currentCellPosition = rowIndex * 7 + colIndex;
                const totalCells = rows * 7;
              
                
                for (let day = 1; day <= daysInMonth; day++) {
                  const dayPosition = (firstDayOfMonth + day - 1) % totalCells;
                  if (dayPosition === currentCellPosition) {
                
                    break;
                  }
                }
                              
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={[
                      "flex items-center justify-center relative",
                      "h-6 w-6 sm:h-10 sm:w-10 rounded-full overflow-hidden",
                      today ? "bg-pink" : "",
                      !badge ? "bg-black" : "",
                    ].join(" ")}
                  >
                    {badge && (
                      <Image
                        src={badge} 
                        alt={`Badge for ${xp} XP`}
                        width={0}
                        height={0}
                        sizes="100vwS"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}