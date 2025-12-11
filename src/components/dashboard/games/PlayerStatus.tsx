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
    className={`flex flex-row justify-start items-center gap-2 sm:gap-3 ${statusColor} p-2 sm:p-3 w-full sm:w-auto sm:min-w-[250px] lg:min-w-[300px] border-1 border-black rounded-full`}
>
    <Image
        src={profile.profile_url || "/dashboard/default-picture.png"}
        alt={""}
        width={100}
        height={100}
        sizes='100vw'
        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
    />
    <div className="flex flex-col justify-start items-start min-w-0 flex-1">
        <h2 className="font-main text-sm sm:text-base text-white truncate w-full">{statusLabel}</h2>
        <h3 className="font-body text-xs sm:text-sm text-gray-300 truncate w-full">@{profile.username}</h3>
    </div>
</div>
  )
}