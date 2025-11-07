import React from "react";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export default function MonthlyProgress() {
  const rows = 4;

  return (
    <div className="w-full h-full">
      <div className="mx-auto w-full h-full rounded-3xl bg-[#10FFE2] p-6 sm:p-8 min-h-[200px] shadow-[0px_8px_28px_-9px_rgba(0,0,0,0.45)]">
        <h2 className="font-main text-2xl sm:text-3xl text-white">My Progress</h2>
        {/* Weekday Headers */}
        <div className="mt-4 grid grid-cols-7 gap-x-4 sm:gap-x-6 text-black">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-center text-base sm:text-lg font-regular">
              {day}
            </div>
          ))}
        </div>

        {/* Dots Grid (4 rows x 7 columns) */}
        <div className="mt-3 grid grid-rows-4 gap-y-4 sm:gap-y-6">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid grid-cols-7 place-items-center gap-x-4 sm:gap-x-6"
            >
              {daysOfWeek.map((_, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={[
                    "flex items-center justify-center",
                    "h-6 w-6 sm:h-10 sm:w-10 rounded-full",
                    "bg-black",
                  ].join(" ")}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


