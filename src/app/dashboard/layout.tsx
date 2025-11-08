// app/dashboard/layout.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayoutClient from '@/components/dashboard/DashboardLayoutClient'
import { DashboardProvider } from '@/components/dashboard/DashboardContext'  
import { GetUserInformation, GetTopUsers, GetDecks, GetFolders, GetDeckCardCounts, GetUnreadNotificationsCount, GetMonthlyXPData, GetDailyLimitsForContext} from '@/lib/queries/dashboard-queries'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
    return 
  }

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [userProfile, topUsers, decks, folders, unreadNotificationCount, monthlyXPData, dailyLimits] = await Promise.all([
    GetUserInformation(),
    GetTopUsers(3),
    GetDecks(),
    GetFolders(),
    GetUnreadNotificationsCount(),
    GetMonthlyXPData(currentYear, currentMonth),
    GetDailyLimitsForContext(), 
  ]);

  if (!userProfile) {
    redirect('/auth/signin')
    return null  
  }

  const recentDecks = decks.slice(0, 5);

  const recentDeckIds = recentDecks.map(deck => deck.id);
  const cardCounts = await GetDeckCardCounts(recentDeckIds);


  return (
    <DashboardProvider 
      userId={userProfile.id}
      username={userProfile.username}
      xp={userProfile.xp}
      profileUrl={userProfile.profile_url}
      leaderboardData={topUsers}
      recentDecks={recentDecks}
      allDecks={decks}
      folders={folders}
      cardCounts={cardCounts}
      unreadNotificationCount={unreadNotificationCount}
      monthlyXPData={monthlyXPData}
      hasSpun={dailyLimits.hasSpun}  
      nextSpinTime={dailyLimits.nextSpinTime}  
    >
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </DashboardProvider>
  );
}