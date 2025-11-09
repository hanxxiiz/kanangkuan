import React from "react";
import { useDashboard } from "./DashboardContext";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export default function MonthlyProgress() {
  const { monthlyXPData } = useDashboard();

  const date = null; // Uncomment to use real date
  
  const rows = 5;
  const today = date || new Date();
  const month = today.getMonth() + 1; // Convert to 1-indexed (1-12)
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
    return monthlyXPData[dateKey] || 0;  // Changed from mockProgressData to monthlyXPData
  };

  return (
    <div className="w-full h-full">
      <div className="mx-auto w-full h-full rounded-3xl bg-[#10FFE2] p-6 min-h-[200px] shadow-[0px_8px_28px_-9px_rgba(0,0,0,0.45)]">
        <h2 className="font-main text-2xl sm:text-3xl text-white">My Progress</h2>
        
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
                let dayNumber = 0;
                
                for (let day = 1; day <= daysInMonth; day++) {
                  const dayPosition = (firstDayOfMonth + day - 1) % totalCells;
                  if (dayPosition === currentCellPosition) {
                    dayNumber = day;
                    break;
                  }
                }
                
                const isValidDay = dayNumber >= 1 && dayNumber <= daysInMonth;
                
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
                      <img 
                        src={badge} 
                        alt={`Badge for ${xp} XP`}
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