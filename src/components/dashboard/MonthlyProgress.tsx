import React from "react";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

// Mock data - replace with actual data from your backend
const mockProgressData: Record<string, number> = {
  "2025-11-01": 600,
  "2025-11-02": 450,
  "2025-11-03": 850,
  "2025-11-04": 1200,
  "2025-11-05": 300,
  "2025-11-06": 520,
  "2025-11-07": 780,
  "2025-11-08": 1100,
  "2025-11-09": 400,
  "2025-11-10": 920,
  "2025-11-11": 650,
  "2025-11-12": 1500,
  "2025-11-13": 800,
  "2025-11-14": 300,
  "2025-11-15": 550,
  "2025-11-16": 1050,
  "2025-11-17": 720,
  "2025-11-18": 480,
  "2025-11-19": 890,
  "2025-11-20": 350,
  "2025-11-21": 1200,
  "2025-11-22": 950,
  "2025-11-23": 650,
  "2025-11-24": 1100,
  "2025-11-25": 500,
  "2025-11-26": 850,
  "2025-11-27": 1300,
  "2025-11-28": 750,
  "2025-11-29": 900,
  "2025-11-30": 1150,
};

export default function MonthlyProgress() {
  // SIMULATION: Change this date to test different days
  // Set to null to use real current date
  //const date = new Date(2025, 11 - 1, 30); // November 30, 2025
  const date = null; // Uncomment to use real date
  
  const rows = 5;
  const today = date || new Date();
  const month = today.getMonth() + 1; // Convert to 1-indexed (1-12)
  const year = today.getFullYear();
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();

  const getBadgeIcon = (xp: number) => {
    if (xp >= 1000) return "/dashboard/badge_3.svg";
    if (xp >= 800) return "/dashboard/badge_2.svg";
    if (xp >= 500) return "/dashboard/badge_1.svg";
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
    return mockProgressData[dateKey] || 0;
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
                      today ? "bg-blue" : "",
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