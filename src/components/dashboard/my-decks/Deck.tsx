import { useRouter } from 'next/navigation';
import React from 'react';

interface DeckProps{
    id: string,
    color?: string;
    deckName?: string;
    cardCount?: number;
}

const colorMap: Record<string, string> = {
  pink: "from-pink to-dark-pink",
  blue: "from-blue to-dark-blue",
  lime: "from-lime to-dark-lime",
  purple: "from-purple to-dark-purple",
  cyan: "from-cyan to-dark-cyan",
};

export default function Deck({
    id,
    color = "pink",
    deckName = "My Deck",
    cardCount,
}:DeckProps) {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/dashboard/my-decks/${id}`);
    };

    const gradient = colorMap[color] || colorMap["pink"];
  return (
    <>
        <div className="flex items-center justify-center"
            onClick={handleClick}
        >
            <div className="relative w-full cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-5">
                <div className={`bg-gradient-to-br ${gradient} rounded-[50px] pt-8`}>
                    <div className="bg-white rounded-t-[30px] p-8 mx-8">
                        <div className="space-y-6">
                            <div className={`h-2 rounded-full bg-gradient-to-br ${gradient}`}></div>
                            <div className={`h-2 rounded-full bg-gradient-to-br ${gradient}`}></div>
                            <div className={`h-2 rounded-full bg-gradient-to-br ${gradient}`}></div>
                        </div>
                    </div>
                    
                    <div className={`relative bg-gradient-to-b ${gradient} rounded-b-[40px] p-9 `}>
                        <div className="text-white">
                            <h1 className="text-3xl font-main">{deckName}</h1>
                            <p className="text-md font-body">{cardCount} Cards</p>
                        </div>  
                    </div>
                </div>
                
                <div className="absolute -bottom-2 left-8 right-8 h-4 bg-black/30 blur-lg rounded-full transition-all duration-500"></div>
            </div>
        </div>
    </>
  );
}