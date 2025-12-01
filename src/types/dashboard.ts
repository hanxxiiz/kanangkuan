export interface UserProfile {
  id: string;          
  username: string;
  xp: number;
  profile_url: string;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  xp: number;
  profile_url: string;
}

export interface Deck {
  id: string;
  deck_name: string;
  deck_color: string;
  folder_id: string | null;
  last_opened: string | null;
  created_by: string;
}

export interface Folder {
  id: string;
  folder_name: string;
  folder_color: string;
  created_by: string;
  created_at?: string;
}

export interface SearchResult {
  type: 'deck' | 'folder';
  id: string;
  name: string;
  color: string;
  folder_id?: string | null;
  last_opened?: string | null;
}

export interface DailyLimits {
  user_id: string;
  last_reset: string;
  has_spun: boolean;
  ai_imports_left: number;
  hints_left: number;
  lives_left: number;
  keys_left: number;
  created_at: string;
}

export interface SpinResult {
  success: boolean;
  reward?: {
    type: RewardType;
    amount: number;
  };
  nextSpinTime?: string;
  error?: string;
}

export interface DashboardContextType {
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
  refreshNotificationCount: () => Promise<void>;
  refreshXp: () => Promise<void>;
  refreshUsername: () => Promise<void>;
  refreshProfileUrl: () => Promise<void>;
  monthlyXPData: Record<string, number>;
  hasSpun: boolean;  
  nextSpinTime: string | null; 
  refreshDailyLimits: () => Promise<void>;  
  updateSpinStatus: (hasSpun: boolean, nextSpinTime: string | null) => void; 
}

export type RewardType = 'ai_imports' | 'hints' | 'lives' | 'keys' | 'xp';