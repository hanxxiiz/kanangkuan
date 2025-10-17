import DailyRewards from "@/components/dashboard/dailyRewards";
import DashboardHeader from "@/components/dashboard/dashboardHeader";
import LeaderboardCard from "@/components/dashboard/leaderboardCard";
import MonthlyProgress from "@/components/dashboard/monthlyProgress";


export default function Dashboard() {
  return (
    <div className="pt-1 space-y-10">
      <DashboardHeader />
      <div className="justify-center items-center relative mx-auto max-w-[1000px] lg:max-w-[1200px] 2xl:max-w-[1500px] sm:px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-stretch ">
          <div className="lg:col-span-2 h-full">
            <MonthlyProgress />
          </div>
          <div className="lg:col-span-1 h-full">
            <DailyRewards />
          </div>
        </div>
        <div className="mt-16 text-left">
          <h2 className="text-3xl font-main text-[#101220] mb-8">
            Leaderboard
          </h2>
        </div>
        <div className="flex justify-center items-center gap-6 flex-wrap">
          <LeaderboardCard rank={2} name="username" xp={666} />
          <LeaderboardCard rank={1} name="username" xp={666} />
          <LeaderboardCard rank={3} name="username" xp={666} />
        </div>

      </div>

    </div>
  );
}