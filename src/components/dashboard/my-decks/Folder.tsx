import { useRouter } from 'next/navigation';
import React from 'react';

interface FolderProps{
    id: string,
    color?: "pink" | "cyan" | "lime" | "purple" | "blue";
    folderName?: string;
    deckCount?: number;
}

const colorMap = {
  pink: ["from-pink", "to-dark-pink"],
  cyan: ["from-cyan", "to-dark-cyan"],
  lime: ["from-lime", "to-dark-lime"],
  purple: ["from-purple", "to-dark-purple"],
  blue: ["from-blue", "to-dark-blue"],
};

export default function Folder({
    id,
    color = "pink",
    folderName = "My Folder",
    deckCount,
}:FolderProps) {
    const [fromColor, toColor] = colorMap[color || "pink"];

    const router = useRouter();
    const handleClick = () => {
        router.push(`/dashboard/my-decks/folder/${id}`);
    };

  return (
    <>
        <div className="flex items-center justify-center p-8"
            onClick={handleClick}
        >
            <div className="relative w-[400px] cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-5">
                <div className={`absolute top-0 left-0 w-3/5 h-40 bg-gradient-to-b ${toColor} ${fromColor} rounded-t-[50px]`}>
                    <div className="absolute mt-7 left-7 right-0 h-8 bg-white rounded-tl-full"></div>
                </div>

                <div className={`absolute top-0 right-0 w-1/2 h-65 bg-gradient-to-b ${fromColor} ${toColor} rounded-t-[50px]`}></div>
                
                <div className={`relative mt-12 bg-gradient-to-b ${fromColor} ${toColor} rounded-[40px] p-9 `}>
                    <div className="text-white mt-30">
                        <h1 className="text-3xl font-main">{folderName}</h1>
                        <p className="text-md font-body">{deckCount} Decks</p>
                    </div>
                </div>

                <div className="absolute -bottom-2 left-8 right-8 h-4 bg-black/30 blur-lg rounded-full transition-all duration-500"></div>
            </div>
        </div>
    </>
  );
}