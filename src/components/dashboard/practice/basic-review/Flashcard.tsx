"use client";
import React, { useState } from "react";
import { LuBot } from "react-icons/lu";
import ChatbotModal from "./ChatbotModal"; 

export default function Flashcard() {
  const [flipped, setFlipped] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

  const handleExplainClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); 
    setShowChatbot(true);
  };

  return (
    <>
      <div 
        className="w-[800px] h-[400px] md:w-[900px] md:h-[460px] 3xl:w-[1000px] 3xl:h-[550px] cursor-pointer"
        onClick={() => setFlipped(!flipped)}
        style={{ perspective: "1000px" }}
      >
        <div
          className="relative w-full h-full transition-transform duration-500"
          style={{ 
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateX(180deg)" : "rotateX(0deg)"
          }}
        >
          {/* Front of card */}
          <div
            className="absolute w-full h-full bg-[#101220] rounded-2xl shadow-lg flex items-center justify-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <button
              onClick={handleExplainClick}
              className="cursor-pointer absolute top-5 right-5 flex items-center gap-2 px-4 py-2 border-1 border-white text-white rounded-full hover:bg-white hover:text-[#101220] transition-all duration-300 font-main text-md z-10"
            >
              <LuBot className="text-xl" />
              <span>Explain</span>
            </button>

            <span className="text-white font-main text-2xl">Question</span>
          </div>

          {/* Back of card */}
          <div
            className="absolute w-full h-full bg-[#101220] rounded-2xl shadow-lg flex items-center justify-center"
            style={{ 
              backfaceVisibility: "hidden",
              transform: "rotateX(180deg)"
            }}
          >
            <span className="text-center text-white font-regular text-2xl px-4">Answer</span>
          </div>
        </div>
      </div>

      {showChatbot && (
        <div className="z-[100]">
          <ChatbotModal 
            showModal={showChatbot} 
            setShowModal={setShowChatbot}
          />
        </div>
      )}
    </>
  );
}