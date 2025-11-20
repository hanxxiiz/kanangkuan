"use client";

import { useEffect, useState } from "react";
import { Profile } from "@/utils/supabase/models";
import { profileService } from "../services";

export function useProfiles(userIds: string[]) {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState<string | null>(null);

    useEffect(() => {
        if (userIds.length > 0) {
            getProfiles();
        }
    }, [userIds]);

    async function getProfiles() {
        try {
            setProfileLoading(true);
            setProfileError(null);
            const data = await profileService.getProfiles(userIds);
            setProfiles(data);
        } catch (err) {
            setProfileError(err instanceof Error ? err.message : "Failed to get profiles.");
        } finally {
            setProfileLoading(false);
        }
    }

    return { profiles, profileLoading, profileError };
}