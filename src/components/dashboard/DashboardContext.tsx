"use client";

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface DashboardContextType {
  userId: string;
  username: string;
  xp: number;
  profileUrl: string | null;
  leaderboardData: any[];
  recentDecks: any[];
  allDecks: any[];
  folders: any[];
  cardCounts: Record<string, number>;
  unreadNotificationCount: number;
  refreshNotificationCount: () => Promise<void>;
  refreshXp: () => Promise<void>;
  monthlyXPData: Record<string, number>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ 
  children,
  userId,
  username,
  xp: initialXp,
  profileUrl,
  leaderboardData,
  recentDecks,
  allDecks,
  folders,
  cardCounts,
  unreadNotificationCount: initialCount,
  monthlyXPData
}: {
  children: ReactNode;
  userId: string;
  username: string;
  xp: number;
  profileUrl: string | null;
  leaderboardData: any[];
  recentDecks: any[];
  allDecks: any[];
  folders: any[];
  cardCounts: Record<string, number>;
  unreadNotificationCount: number;
  monthlyXPData: Record<string, number>;
}) {
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(initialCount);
  const [currentXp, setCurrentXp] = useState(initialXp);
  const supabase = createClient();

  const refreshNotificationCount = async () => {
    try {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);
      
      setUnreadNotificationCount(count || 0);
    } catch (error) {
      console.error('Failed to refresh notification count:', error);
    }
  };

  const refreshXp = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('xp')
        .eq('id', userId)
        .single();
      
      if (data && !error) {
        setCurrentXp(data.xp);
      }
    } catch (error) {
      console.error('Failed to refresh XP:', error);
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel('notifications_changes')
      .on(
        'postgres_changes',
        {
          event: '*', 
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        () => {
          refreshNotificationCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  useEffect(() => {
    const channel = supabase
      .channel('user_xp_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          console.log('XP Update received:', payload);
          if (payload.new && 'xp' in payload.new) {
            console.log('Setting new XP:', payload.new.xp);
            setCurrentXp(payload.new.xp);
          }
        }
      )
      .subscribe((status) => {
        console.log('XP subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Fallback (if dim gana realtime): Poll for XP changes every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshXp();
    }, 10000); 

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      refreshNotificationCount();
      refreshXp();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  return (
    <DashboardContext.Provider value={{
      userId,
      username,
      xp: currentXp,
      profileUrl,
      leaderboardData,
      recentDecks,
      allDecks,
      folders,
      cardCounts,
      unreadNotificationCount,
      refreshNotificationCount,
      refreshXp,
      monthlyXPData,
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
}