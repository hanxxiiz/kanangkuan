import { PlayerStatus as PlayerStatusType } from '@/types/challenge-gameplay';
import Image from 'next/image';
import React from 'react'

interface Props {
  playerUsername: string;
  playerProfile?: string;
  status: PlayerStatusType;
}

export default function PlayerStatus({playerUsername, playerProfile, status} : Props) {

  const statusLabel = (() => {
    switch(status) {
      case 'answering': return 'Kanang...';
      case 'done': return 'Done';
      case 'correct': return 'Correct!';
      case 'wrong': return 'Wrong!';
      default: return '';
    }
  }) ();

  const statusColor = (() => {
    switch(status) {
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
            src={playerProfile || "/dashboard/default-picture.png"}
            alt={""}
            width={100}
            height={100}
            sizes='100vw'
            className="w-10 h-10 rounded-full"
        />
        <div className="flex flex-col justify-start items-start">
            <h2 className="font-main text-base text-white">{statusLabel}</h2>
            <h3 className="font-body text-xs text-gray-300">@{playerUsername}</h3>
        </div>
    </div>
  )
}
