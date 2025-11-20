"use client";

import { createClient } from '@/utils/supabase/client';
import React, { useEffect, useState } from 'react';
import { useUser } from '@/lib/hooks/useUser';
import { useProfiles } from '@/lib/hooks/useProfile';
import { Button } from '@/components/buttons/PrimaryButton';

export default function WaitingPlayers({ challengeId }: { challengeId: string }) {
    const { user } = useUser();
    const [joinedPlayers, setJoinedPlayers] = useState<string[]>([]);
    const { profiles } = useProfiles(joinedPlayers);
    const supabase = createClient();

    useEffect(() => {
        if (!user?.id) return;

        const channel = supabase.channel(`${challengeId}`);

        channel
            .on('presence', { event: 'sync' }, () => {
                const userIds = [];
                for (const id in channel.presenceState()) {
                    // @ts-ignore
                    const userId = channel.presenceState()[id][0].user_id;
                    if (userId) {
                        userIds.push(userId);
                    }
                }
                setJoinedPlayers([...new Set(userIds)]);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        user_id: user.id,
                        online_at: new Date().toISOString(),
                    });
                }
            });

        return () => {
            channel.unsubscribe();
        };
    }, [user]);

    return (
        <div className="flex flex-col justify-center items-center gap-5">
            <div className="flex flex-row items-center justify-center gap-10">
                {profiles.map((profile) => (
                    <div 
                        className="flex flex-row justify-start items-center gap-3 bg-white p-3 w-75 border-3 border-black rounded-full" 
                        key={profile.id}
                    >
                        <img 
                            src={profile.profile_url}
                            className="w-15 h-15 rounded-full"
                        />
                        <div className="flex flex-col justify-start items-start">
                            <h2 className="font-main text-xl text-lime">Joined</h2>
                            <h3 className="font-body text-sm text-gray-600">{profile.username}</h3>
                        </div>
                    </div>
                ))}
            </div>
            <Button
                variant='flat'
                size='lg'
                className="w-100 py-4 text-xl"
            >
                Ready
            </Button>
        </div>
    );
}