import { PresencePayload } from '@/lib/hooks/useRealtimeChallenge';
import Image from 'next/image';
import React from 'react'

interface Props {
  profile: {
    id: string;
    profile_url: string;
    username: string;
  };
  presence: PresencePayload | undefined;
  showResult?: boolean;
}

export default function PlayerStatus({ profile, presence, showResult = false } : Props) {
  const status = presence?.status || 'answering';

  const displayStatus = !showResult && (status === 'correct' || status === 'wrong') 
    ? 'done' 
    : status;

  const statusLabel = (() => {
    switch(displayStatus) {
      case 'answering': return 'Kanang...';
      case 'done': return 'Done';
      case 'correct': return 'Correct!';
      case 'wrong': return 'Wrong!';
      default: return '';
    }
  }) ();

  const statusColor = (() => {
    switch(displayStatus) {
      case 'answering': return 'bg-purple';
      case 'done': return 'bg-cyan';
      case 'correct': return 'bg-lime';
      case 'wrong': return 'bg-pink';
      default: return 'bg-black';
    }
  }) ();

  return (
    <div 
        className={`flex flex-row justify-start items-center gap-3 ${statusColor} p-3 w-75 border-1 border-black rounded-full`}
    >
        <Image
            src={profile.profile_url || "/dashboard/default-picture.png"}
            alt={""}
            width={100}
            height={100}
            sizes='100vw'
            className="w-10 h-10 rounded-full"
        />
        <div className="flex flex-col justify-start items-start">
            <h2 className="font-main text-base text-white">{statusLabel}</h2>
            <h3 className="font-body text-xs text-gray-300">@{profile.username}</h3>
        </div>
    </div>
  )
}