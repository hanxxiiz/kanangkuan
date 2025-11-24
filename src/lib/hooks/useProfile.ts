"use client";

import { useEffect, useState, useMemo } from "react";
import { Profile } from "@/utils/supabase/models";
import { profileService } from "../services";

type UseProfilesParams = {
  userId?: string;
  userIds?: string[];
};

export function useProfiles({ userId, userIds }: UseProfilesParams) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stableUserIds = useMemo(() => userIds?.slice() || [], [userIds?.join(",")]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        if (userId) {
          const data = await profileService.getProfiles([userId]);
          setProfile(data[0] || null);
          setProfiles([]);
        } else if (stableUserIds.length > 0) {
          const data = await profileService.getProfiles(stableUserIds);
          setProfiles(data);
          setProfile(null);
        } else {
          setProfile(null);
          setProfiles([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch profile(s).");
        setProfile(null);
        setProfiles([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userId, stableUserIds]);

  return { profile, profiles, loading, error };
}
