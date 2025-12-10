"use client";

import { createContext, useContext, ReactNode, useEffect, useState, useCallback, useRef } from 'react';
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
  const [isOnline, setIsOnline] = useState(true);
  const supabase = createClient();
  
  // Track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);
  
  // Track retry attempts to prevent infinite loops
  const retryCount = useRef({ username: 0, notifications: 0, xp: 0 });
  const MAX_RETRIES = 3;

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshUsername = useCallback(async () => {
    if (typeof window === 'undefined' || !isMounted.current || !isOnline) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      if (data && isMounted.current) {
        setCurrentUsername(data.username);
        retryCount.current.username = 0;
      }
    } catch {
      retryCount.current.username++;
      
      // Only log if we've exceeded retries
      if (retryCount.current.username >= MAX_RETRIES) {
        console.error('Failed to refresh username after retries');
        retryCount.current.username = 0;
      }
    }
  }, [supabase, userId, isOnline]);

  const refreshNotificationCount = useCallback(async () => {
    if (typeof window === 'undefined' || !isMounted.current || !isOnline) return;
    
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);
      
      if (error) throw error;
      
      if (isMounted.current) {
        setUnreadNotificationCount(count || 0);
        retryCount.current.notifications = 0;
      }
    } catch {
      retryCount.current.notifications++;
      
      if (retryCount.current.notifications >= MAX_RETRIES) {
        // Silent fail - keep existing count
        retryCount.current.notifications = 0;
      }
    }
  }, [supabase, userId, isOnline]); 

  const refreshXp = useCallback(async () => {
    if (typeof window === 'undefined' || !isMounted.current || !isOnline) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('xp')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      if (data && isMounted.current) {
        setCurrentXp(data.xp);
        retryCount.current.xp = 0;
      }
    } catch {
      retryCount.current.xp++;
      
      if (retryCount.current.xp >= MAX_RETRIES) {
        // Silent fail - keep existing XP
        retryCount.current.xp = 0;
      }
    }
  }, [supabase, userId, isOnline]);

  const refreshDailyLimits = useCallback(async () => {
    if (typeof window === 'undefined' || !isMounted.current || !isOnline) return;
    
    try {
      const { data, error } = await supabase
        .from('user_daily_limits')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      
      if (data && isMounted.current) {
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
    } catch {
      // Silent fail
    }
  }, [supabase, userId, isOnline]);

  const updateSpinStatus = useCallback((newHasSpun: boolean, newNextSpinTime: string | null) => {
    if (isMounted.current) {
      setHasSpun(newHasSpun);
      setNextSpinTime(newNextSpinTime);
    }
  }, []);

  // Setup realtime subscriptions only on client
  useEffect(() => {
    if (typeof window === 'undefined' || !isOnline) return;

    const usernameChannel = supabase
      .channel('user_username_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
        (payload) => {
          if (payload.new && 'username' in payload.new && isMounted.current) {
            setCurrentUsername(payload.new.username);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(usernameChannel);
    };
  }, [userId, supabase, isOnline]);

  useEffect(() => {
    if (typeof window === 'undefined' || !isOnline) return;

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
          if (isMounted.current) {
            refreshNotificationCount();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refreshNotificationCount, supabase, isOnline]);

  useEffect(() => {
    if (typeof window === 'undefined' || !isOnline) return;

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
          if (payload.new && 'xp' in payload.new && isMounted.current) {
            setCurrentXp(payload.new.xp as number);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase, isOnline]);

  // Polling fallback - only when online
  useEffect(() => {
    if (typeof window === 'undefined' || !isOnline) return;

    const interval = setInterval(() => {
      if (isMounted.current && isOnline) {
        refreshXp();
      }
    }, 30000); // Increased to 30 seconds to reduce load

    return () => clearInterval(interval);
  }, [refreshXp, isOnline]);

  // Refresh on window focus - with debounce
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: NodeJS.Timeout;
    
    const handleFocus = () => {
      if (!isOnline || !isMounted.current) return;
      
      // Debounce to prevent multiple rapid calls
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (isMounted.current && isOnline) {
          refreshUsername();
          refreshNotificationCount();
          refreshXp();
        }
      }, 500);
    };
    
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearTimeout(timeoutId);
    };
  }, [refreshNotificationCount, refreshXp, refreshUsername, isOnline]);

  return (
    <DashboardContext.Provider value={{
      userId,
      username: currentUsername,
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