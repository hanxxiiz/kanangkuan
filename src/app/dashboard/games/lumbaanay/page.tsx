"use client";

import { useGameModal } from "@/components/dashboard/games/GameModal";
import LumbaanaySettings from "@/components/dashboard/games/LumbaanaySettings";

export default function LumbaanayPage() {
  const { GameModal, setShowModal } = useGameModal();
  return (
    <div className="min-h-screen bg-gradient-to-tr from-cyan via-yellow-100 to-lime/50">
      <GameModal heading="Bet & Bait" xp={100}>
        <div className="absolute bottom-8 text-5xl text-lime font-main">00:00</div>
        <div className="flex flex-col items-start justify-center">
          <div className="font-main text-2xl text-center mb-3">{"Sino ang mahilig mag basketbol?"}</div>
          <input 
            placeholder="20xp at stake"
            className="w-full outline-none border-b-1 placeholder:text-center py-1 text-4xl font-main"
          />
          <div className="text-left font-italic text-xs text-purple">Enter fake answer</div>
        </div>
      </GameModal>
    <button onClick={() => setShowModal(true)}>Open modal</button>
    </div>
  )
}
