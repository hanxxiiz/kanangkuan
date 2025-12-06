"use client";

import ChallengeSettings from '@/components/dashboard/games/ChallengeSettings'
import { useSearchParams } from 'next/navigation'

export default function ChallengePage() {
  const searchParams = useSearchParams();
  const deckId = searchParams.get("deckId");

  return (
    <div className="min-h-screen bg-gradient-to-tr from-cyan via-yellow-100 to-lime/50">
      <ChallengeSettings practiceDeckId={deckId} />
    </div>
  )
}
