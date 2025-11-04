"use client";
import React, { useState } from "react";
import Flashcard from "@/components/dashboard/practice/basic-review/Flashcard";
import { TbKeyFilled } from "react-icons/tb";
import { GrLinkPrevious, GrLinkNext } from "react-icons/gr";

const BasicReview = () => {
  const [keysRemaining, setKeysRemaining] = useState(5);
  const [currentCard, setCurrentCard] = useState(0);
  const [nextCard, setNextCard] = useState<number | null>(null);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
  const [animatingOut, setAnimatingOut] = useState(false);
  const totalCards = 100;
  
  const handlePrevious = () => {
    const newCard = currentCard > 0 ? currentCard - 1 : totalCards - 1;
    setSlideDirection('right');
    setNextCard(newCard);
    setAnimatingOut(true);
    
    setTimeout(() => {
      setCurrentCard(newCard);
      setNextCard(null);
      setAnimatingOut(false);
    }, 300);
  };
  
  const handleNext = () => {
    const newCard = currentCard < totalCards - 1 ? currentCard + 1 : 0;
    setSlideDirection('left');
    setNextCard(newCard);
    setAnimatingOut(true);
    
    setTimeout(() => {
      setCurrentCard(newCard);
      setNextCard(null);
      setAnimatingOut(false);
    }, 300);
  };
  
  return (
    <div className="w-full h-full flex flex-col items-center overflow-hidden pt-20 sm:pt-30 xl:pt-0">
      {/* Keys Section*/}
      <div className="w-full max-w-[900px] flex justify-end px-6 flex-shrink-0 mb-4 sm:mb-10">
        <div className="flex items-center group">
          {Array.from({ length: keysRemaining }).map((_, index) => (
            <TbKeyFilled
              key={index} 
              className="cursor-pointer text-4xl text-gray-200 text-lime sm:text-gray-200 group-hover:text-lime transition-colors duration-300"
            />
          ))}
        </div>
      </div>
      
      {/* Flashcard Section */}
      <div className="w-full max-w-[900px] px-6 flex-shrink-0">
        <div className="relative w-full" style={{ height: '400px' }}>
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              animation: animatingOut 
                ? slideDirection === 'right' 
                  ? 'slideOutRight 0.3s ease-in-out forwards'
                  : 'slideOutLeft 0.3s ease-in-out forwards'
                : 'none',
            }}
          >
            <Flashcard key={`current-${currentCard}`} />
          </div>
          
          {nextCard !== null && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                animation: slideDirection === 'right' 
                  ? 'slideInFromLeft 0.3s ease-in-out forwards'
                  : 'slideInFromRight 0.3s ease-in-out forwards'
              }}
            >
              <Flashcard key={`next-${nextCard}`} />
            </div>
          )}
        </div>
      </div>

      {/* Navigation Section */}
      <div className="w-full max-w-[900px] flex justify-center items-center gap-10 px-6 flex-shrink-0 mt-15">
        <button
          onClick={handlePrevious}
          className="z-50 cursor-pointer border-[2px] border-[#101220] rounded-full px-8 py-4 text-[#101220] hover:bg-[#101220] hover:text-white transition-colors duration-300"
        >
          <GrLinkPrevious className="textl-xl sm:text-2xl" />
        </button>
        <span className="text-[#101220] text-lg font-body min-w-[80px] text-center">
          {currentCard + 1}/{totalCards}
        </span>
        <button
          onClick={handleNext}
          className="z-50 cursor-pointer border-[2px] border-[#101220] rounded-full px-8 py-4 text-[#101220] hover:bg-[#101220] hover:text-white transition-colors duration-300"
        >
          <GrLinkNext className="text-xl sm:text-2xl" />
        </button>
      </div>
      
      <style jsx>{`
        @keyframes slideOutLeft {
          from {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
          to {
            transform: translateX(-150%) scale(1.2);
            opacity: 0.5;
          }
        }
        
        @keyframes slideOutRight {
          from {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
          to {
            transform: translateX(150%) scale(1.2);
            opacity: 0.5;
          }
        }
        
        @keyframes slideInFromLeft {
          from {
            transform: translateX(-150%) scale(1.2);
            opacity: 0.5;
          }
          to {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes slideInFromRight {
          from {
            transform: translateX(150%) scale(1.2);
            opacity: 0.5;
          }
          to {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default BasicReview;