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
    <div className="my-5 flex flex-col items-center justify-center gap-4"> 
      <div className="text-black -mb-2 text-sm font-regular">
        Share this with your friends and hop on the challenge!
      </div> 

      <div className="flex flex-row items-center justify-between gap-3"> 
        {[...Array(5)].map((_, i) => ( 
          <div 
            key={i} 
            className={`text-center h-35 w-23 px-1 border-2 border-black rounded-2xl outline-none text-7xl flex items-center justify-center ${colors[i]}`}
          > 
            {joinCode[i] || ""} 
          </div>
        ))} 
      </div> 

      <div className="text-gray-400 -mt-2 text-xs font-italic">
        NOTE: This code will only be valid after clicking play.
      </div> 

      <Button variant="outline" onClick={handleGenerate} disabled={isGenerating}> 
        {isGenerating ? "Generating..." : "Generate"}
      </Button> 
    </div> 
  );
}