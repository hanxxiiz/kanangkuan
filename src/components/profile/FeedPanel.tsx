"use client"
import ProfileLevelBar from "./Levelbar"
import ProfileMonthlyProgress from "./ProfileMonthlyProgress"
import RecentDeck from "./RecentDeck";

type FeedPanelProps = {
    switchToDecks: () => void;
}

export default function Feed({switchToDecks}: FeedPanelProps) {

    return (
        <div>
            {/* XP */}
                    <div className="pb-3.5">
                        <h1 className="font-main text-3xl text-gray-900 py-3.5">XP</h1>
                        <div className="py-5 w-full max-h-2xl h-40 border-1 border-black rounded-2xl">
                            <ProfileLevelBar/>
                        </div>
                    </div>

            {/*Monthly Progress */}
                    <div className="py-3.5">
                        <h1 className="font-main text-3xl text-gray-900 py-3.5">My Progress</h1>
                        <ProfileMonthlyProgress/>
                    </div>

            {/* Decks */}
                    <div className="my-3.5">
                        <div className="flex items-center justify-between">   
                            <h1 className="font-main text-3xl text-gray-900 py-3.5">Decks</h1>
                            <button className="items-self-end text-md text-gray-900 hover:underline cursor-pointer"
                                    onClick={switchToDecks}>
                                        View all</button>
                        </div>
                        <RecentDeck/>
                    </div>        
        </div>
    )
}