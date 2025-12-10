"use client";

import { createContext, useContext, ReactNode, useEffect, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { DashboardContextType, LeaderboardEntry, Deck, Folder } from '@/types/dashboard';

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
  monthlyXPData,
  hasSpun: initialHasSpun,  
  nextSpinTime: initialNextSpinTime, 
}: {
  children: ReactNode;
  userId: string;
  username: string;
  xp: number;
  profileUrl: string | null;
  leaderboardData: LeaderboardEntry[];
  recentDecks: Deck[];
  allDecks: Deck[];
  folders: Folder[];
  cardCounts: Record<string, number>;
  unreadNotificationCount: number;
  monthlyXPData: Record<string, number>;
  hasSpun: boolean;  
  nextSpinTime: string | null; 
}) {
  const [currentUsername, setCurrentUsername] = useState(username);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(initialCount);
  const [currentXp, setCurrentXp] = useState(initialXp);
  const [hasSpun, setHasSpun] = useState(initialHasSpun);  
  const [nextSpinTime, setNextSpinTime] = useState(initialNextSpinTime);  
  const supabase = createClient();

  const refreshUsername = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();
      if (data && !error) setCurrentUsername(data.username);
    } catch (err) {
      console.error('Failed to refresh username:', err);
    }
  }, [supabase, userId]);

  const refreshNotificationCount = useCallback(async () => {
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
  }, [supabase, userId]); 

  const refreshXp = useCallback(async () => {
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
  }, [supabase, userId]);

  const refreshDailyLimits = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('user_daily_limits')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (data && !error) {
        setHasSpun(data.has_spun);
        
        if (data.has_spun) {
          const now = new Date();
          const nextMidnight = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1,
            0, 0, 0, 0
          );
          setNextSpinTime(nextMidnight.toISOString());
        } else {
          setNextSpinTime(null);
        }
      }
    } catch (error) {
      console.error('Failed to refresh daily limits:', error);
    }
  }, [supabase, userId]);

  const updateSpinStatus = useCallback((newHasSpun: boolean, newNextSpinTime: string | null) => {
    setHasSpun(newHasSpun);
    setNextSpinTime(newNextSpinTime);
  }, []);

   useEffect(() => {
    // Username changes
    const usernameChannel = supabase
      .channel('user_username_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
        (payload) => {
          if (payload.new && 'username' in payload.new) {
            setCurrentUsername(payload.new.username);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(usernameChannel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, refreshNotificationCount]);

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
            setCurrentXp(payload.new.xp as number);
          }
        }
      )
      .subscribe((status) => {
        console.log('XP subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Fallback (if dim gana realtime): Poll for XP changes every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshXp();
    }, 10000); 

    return () => clearInterval(interval);
  }, [refreshXp]);

  useEffect(() => {
    const handleFocus = () => {
      refreshUsername();
      refreshNotificationCount();
      refreshXp();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshNotificationCount, refreshXp, refreshUsername]);

  return (
    <DashboardContext.Provider value={{
      userId,
      username: currentUsername,
      xp: currentXp,
      profileUrl: currentProfileUrl,
      refreshProfileUrl,
      leaderboardData,
      recentDecks,
      allDecks,
      folders,
      cardCounts,
      unreadNotificationCount,
      refreshNotificationCount,
      refreshXp,
      refreshUsername,
      monthlyXPData,
      hasSpun, 
      nextSpinTime,
      refreshDailyLimits,  
      updateSpinStatus,
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
