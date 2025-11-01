import React from 'react';

interface DeckProps{
    color?: "pink" | "cyan" | "lime" | "purple" | "blue";
    deckName?: string;
    cardCount?: number;
    onClick?: () => void;
}

const colorMap = {
  pink: ["from-pink", "to-dark-pink"],
  cyan: ["from-cyan", "to-dark-cyan"],
  lime: ["from-lime", "to-dark-lime"],
  purple: ["from-purple", "to-dark-purple"],
  blue: ["from-blue", "to-dark-blue"],
};

export default function Deck({
    color = "pink",
    deckName = "My Deck",
    cardCount,
    onClick = () => {},
}:DeckProps) {
    const [fromColor, toColor] = colorMap[color || "pink"];
  return (
    <>
        <div className="flex items-center justify-center p-8">
            <div className="relative w-[400px] cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-5">
                <div className={`bg-gradient-to-br ${fromColor} ${toColor} rounded-[50px] pt-8`}>
                    <div className="bg-white rounded-t-[30px] p-8 mx-8">
                        <div className="space-y-6">
                            <div className={`h-2 rounded-full bg-gradient-to-br ${fromColor} ${toColor}`}></div>
                            <div className={`h-2 rounded-full bg-gradient-to-br ${fromColor} ${toColor}`}></div>
                            <div className={`h-2 rounded-full bg-gradient-to-br ${fromColor} ${toColor}`}></div>
                        </div>
                    </div>
                    
                    <div className={`relative bg-gradient-to-b ${fromColor} ${toColor} rounded-b-[40px] p-9 `}>
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