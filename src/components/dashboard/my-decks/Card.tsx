import { useRouter } from 'next/navigation';
import React from 'react';
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";

interface CardProps{
    id: string,
    color?: "pink" | "cyan" | "lime" | "purple" | "blue";
    front?: string;
    back?: string;
}

const colorMap = {
  pink: "bg-pink",
  cyan: "bg-cyan",
  lime: "bg-lime",
  purple: "bg-purple",
  blue: "bg-blue",
};

export default function Card({
    id,
    color = "pink",
    front,
    back,
}:CardProps) {
    const bgColor = colorMap[color || "pink"];
  return (
    <>
        <div className="flex items-center justify-center p-5">
            <div className="relative w-[550px] cursor-pointer transition-all duration-200 ease-in-out hover:-translate-y-1">
                <div className="bg-white outline-2 rounded-t-2xl p-8">
                    <button className="absolute top-2 right-2 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
                        <PiDotsThreeOutlineVerticalFill className="text-xl text-black" />
                    </button>
                    <div className="text-black">
                        <p className="text-md font-body">{front}</p>
                    </div>
                </div>

                <div className={`relative ${bgColor} outline-2 rounded-b-2xl py-4 px-8 `}>
                    <div className="text-white">
                        <h1 className="text-lg font-main">{back}</h1>
                    </div>  
                </div>
            </div>
        </div>
    </>
  );
}