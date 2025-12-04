"use client"
import LevelBar from "./Levelbar";
import MonthlyProgress from "./ProfileMonthlyProgress";

export default function StatsPanel() {
    return (
        <div>
            {/* XP */}
            <div className="pb-3.5">
                <h1 className="font-main text-3xl text-gray-900 py-3.5">XP</h1>
                <div className="py-5 w-full max-h-2xl h-40 border-1 border-black rounded-2xl">
                        <LevelBar/>
                </div>
            </div>
                    

            {/* My Progress */}
            <div className="py-3.5">
                <h1 className="font-main text-3xl text-gray-900 py-3.5">My Progress</h1>
                <MonthlyProgress/>
            </div>
        </div>
    )
}
