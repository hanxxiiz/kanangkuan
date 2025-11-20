import PlayerStatus from '@/components/dashboard/games/PlayerStatus'
import React from 'react'

export default function ChallengePlay({ params }: {
  params: Promise<{ challengeId: string }>
}) {
  return (
    <div className="min-h-screen flex flex-col">
        <div className="fixed flex flex-col top-0 right-0 items-center justify-center">
            <img src="/dashboard/star.svg" className="w-20 mt-5 mx-5" />
            <h2 className="text-base text-white font-main">1000 XP</h2>
        </div>

        <div className="flex flex-col items-center space-y-5 w-full flex-1">

            <div className="flex flex-row items-center justify-center gap-5 mt-10">
                <PlayerStatus />
                <PlayerStatus />
                <PlayerStatus />
            </div>

            <div className="flex flex-col lg:flex-row w-full h-full lg:px-20 p-5 mb-5 lg:mb-25 flex-1 lg:gap-10 gap-3">
                <div
                    className="flex-1 h-auto flex items-center justify-center rounded-3xl p-10 border border-white"
                >
                    <p className="text-center font-main text-white text-md lg:text-xl max-w-md">
                        A playful collections of tools and features you can flip through with ease.
                        Each deck is designed to keep things simple, handy, and a little more fun,
                        so you can discover, learn, and do more without the boring stuff.
                    </p>
                </div>

                <div className="flex flex-col flex-1 justify-between gap-3 lg:gap-5">
                    <div className="p-3 text-center border border-white rounded-3xl h-full font-body text-base lg:text-lg text-white">dassadadasd</div>
                    <div className="p-3 text-center border border-white rounded-3xl h-full font-body text-base lg:text-lg text-white">dassadadasd</div>
                    <div className="p-3 text-center border border-white rounded-3xl h-full font-body text-base lg:text-lg text-white">dassadadasd</div>
                    <div className="p-3 text-center border border-white rounded-3xl h-full font-body text-base lg:text-lg text-white">dassadadasd</div>
                </div>

            </div>
        </div>
    </div>
  )
}