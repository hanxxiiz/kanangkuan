"use client";

import { useState } from "react";
import { Button } from "@/components/buttons/PrimaryButton";
import { useChallenges } from '@/lib/hooks/useChallenges';

interface HostTabProps {
  onDataChange: (data: { joinCode: string }) => void;
}

export default function HostTab({ onDataChange }: HostTabProps) {
  const [joinCode, setJoinCode] = useState(""); 
  const [isGenerating, setIsGenerating] = useState(false);
  const { generateUniqueJoinCode } = useChallenges();
  const colors = ["text-purple", "text-pink", "text-lime", "text-cyan", "text-blue"];

  const handleGenerate = async () => { 
    setIsGenerating(true);
    try {
      const code = await generateUniqueJoinCode();
      setJoinCode(code);
      onDataChange({ joinCode: code });
      console.log("Generated unique join code:", code);
    } catch (error) {
      console.error("Failed to generate unique code:", error);
      alert("Failed to generate a unique code. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="my-4 sm:my-5 flex flex-col items-center justify-center gap-3 sm:gap-4"> 
  <div className="text-black text-xs sm:text-sm font-regular text-center px-2">
    Share this with your friends and hop on the challenge!
  </div> 

  <div className="flex flex-row items-center justify-center gap-2 sm:gap-3 w-full px-2"> 
    {[...Array(5)].map((_, i) => ( 
      <div 
        key={i} 
        className={`text-center h-20 w-16 sm:h-28 sm:w-20 lg:h-35 lg:w-23 px-1 border-2 border-black rounded-xl sm:rounded-2xl outline-none text-4xl sm:text-5xl lg:text-7xl flex items-center justify-center font-bold ${colors[i]}`}
      > 
        {joinCode[i] || ""} 
      </div>
    ))} 
  </div> 

  <div className="text-gray-400 text-xs sm:text-sm font-italic text-center px-2">
    NOTE: This code will only be valid after clicking play.
  </div> 

  <Button variant="outline" onClick={handleGenerate} disabled={isGenerating}> 
    {isGenerating ? "Generating..." : "Generate"}
  </Button> 
</div>
  );
}