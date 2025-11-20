"use client";
import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
import Flashcard from "@/components/dashboard/practice/basic-review/Flashcard";
import { TbKeyFilled } from "react-icons/tb";
import { GrLinkPrevious, GrLinkNext } from "react-icons/gr";
import { useParams } from "next/navigation";
import { Card } from "@/lib/queries/basic-review-queries";
import { DecrementUserKeys } from "@/lib/actions/basic-review-actions";
import ChatbotModal from "@/components/dashboard/practice/basic-review/ChatbotModal";
import { SortOrderContext, PracticeDataContext } from "@/components/dashboard/practice/PracticeLayout";

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

type SlideDirection = 'left' | 'right';

const BasicReview = () => {
  const params = useParams();
  const deckId = params.deckId as string;
  const { sortOrder } = useContext(SortOrderContext);
  const initialData = useContext(PracticeDataContext);

  const [originalCards, setOriginalCards] = useState<Card[]>(initialData?.cards || []);
  const [keysRemaining, setKeysRemaining] = useState(initialData?.keys || 0);
  const [userProfilePic, setUserProfilePic] = useState<string | null>(initialData?.profilePic || null);

  const [currentCard, setCurrentCard] = useState(0);
  const [nextCard, setNextCard] = useState<number | null>(null);
  const [slideDirection, setSlideDirection] = useState<SlideDirection>('left');
  const [animatingOut, setAnimatingOut] = useState(false);
  
  const [showChatModal, setShowChatModal] = useState(false);
  const [currentCardForChat, setCurrentCardForChat] = useState<Card | null>(null);
  const [modalHasKeys, setModalHasKeys] = useState(false);
  
  const flashcardRef = useRef<HTMLDivElement>(null);

  // Sync initial data from context
  useEffect(() => {
    if (initialData) {
      setOriginalCards(initialData.cards || []);
      setKeysRemaining(initialData.keys || 0);
      setUserProfilePic(initialData.profilePic || null);
    }
  }, [initialData]);

  // Sort cards based on selected order
  const cards = useMemo(() => {
    if (!originalCards.length) return [];
    
    const cardsWithIndex = originalCards.map((card, index) => ({
      ...card,
      originalIndex: index 
    }));

    switch (sortOrder) {
      case 'newest_first':
        return cardsWithIndex.sort((a, b) => b.originalIndex - a.originalIndex);
      case 'random_order':
        return shuffleArray(cardsWithIndex);
      default: // 'oldest_first'
        return cardsWithIndex.sort((a, b) => a.originalIndex - b.originalIndex);
    }
  }, [originalCards, sortOrder]);

  // Reset to first card when sort order changes
  useEffect(() => {
    setCurrentCard(0);
    setNextCard(null);
    setAnimatingOut(false);
  }, [sortOrder]);

  const handleExplainClick = async () => {
    const hadKeys = keysRemaining > 0;

    if (!hadKeys) {
      setModalHasKeys(false);
      setCurrentCardForChat(cards[currentCard]);
      setShowChatModal(true);
      return;
    }

    const result = await DecrementUserKeys();

    if (result.success) {
      setKeysRemaining(result.keysLeft);
      setTimeout(() => {
        setModalHasKeys(true); 
        setCurrentCardForChat(cards[currentCard]);
        setShowChatModal(true);
      }, 50);
    } else {
      setModalHasKeys(false);
      setCurrentCardForChat(cards[currentCard]);
      setShowChatModal(true);
    }
  };

  const navigateCard = (direction: SlideDirection) => {
    if (animatingOut) return;
    
    const totalCards = cards.length;
    const newCard = direction === 'left'
      ? (currentCard < totalCards - 1 ? currentCard + 1 : 0)
      : (currentCard > 0 ? currentCard - 1 : totalCards - 1);
    
    setSlideDirection(direction);
    setNextCard(newCard);
    setAnimatingOut(true);
    
    setTimeout(() => {
      setCurrentCard(newCard);
      setNextCard(null);
      setAnimatingOut(false);
    }, 300);
  };

  const handleFlip = () => {
    const clickable = flashcardRef.current?.querySelector(
      '[role="button"], button, .cursor-pointer'
    ) as HTMLElement;
    
    (clickable || flashcardRef.current)?.click();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          navigateCard('right');
          break;
        case 'ArrowRight':
          navigateCard('left');
          break;
        case 'Enter':
          handleFlip();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentCard, animatingOut]);

  if (!cards.length) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-xl">No cards found in this deck</p>
      </div>
    );
  }

  const getAnimationStyle = (isOutgoing: boolean) => {
    if (!isOutgoing) return { animation: 'none' };
    
    const direction = slideDirection === 'right' ? 'Right' : 'Left';
    return { animation: `slideOut${direction} 0.3s ease-in-out forwards` };
  };

  const getIncomingAnimationStyle = () => {
    const direction = slideDirection === 'right' ? 'Left' : 'Right';
    return { animation: `slideInFrom${direction} 0.3s ease-in-out forwards` };
  };

  return (
    <div className="w-full h-full flex flex-col items-center overflow-hidden pt-20 sm:pt-30 xl:pt-0">
      {/* Keys Display */}
      <div className="w-full max-w-[900px] flex justify-end px-6 flex-shrink-0 mb-4 sm:mb-10 min-h-[42px]">
        {keysRemaining > 0 && (
          <div className="flex items-center group">
            {Array.from({ length: keysRemaining }).map((_, i) => (
              <TbKeyFilled
                key={i} 
                className="cursor-pointer text-4xl text-gray-200 text-lime sm:text-gray-200 group-hover:text-lime transition-colors duration-300"
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Flashcard Section */}
      <div className="w-full max-w-[900px] px-2 sm:px-6 flex-shrink-0">
        <div className="relative w-full h-[400px]">
          {/* Current Card */}
          <div
            ref={flashcardRef}
            className="absolute inset-0 flex items-center justify-center"
            style={getAnimationStyle(animatingOut)}
          >
            <Flashcard 
              card={cards[currentCard]} 
              key={`current-${currentCard}`}
              onExplainClick={handleExplainClick}
              hasKeys={keysRemaining > 0}  
            />
          </div>
          
          {/* Next Card (during animation) */}
          {nextCard !== null && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={getIncomingAnimationStyle()}
            >
              <Flashcard 
                card={cards[nextCard]} 
                key={`next-${nextCard}`}
                onExplainClick={handleExplainClick}
                hasKeys={keysRemaining > 0} 
              />
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="w-full max-w-[900px] flex justify-center items-center gap-5 sm:gap-10 px-6 flex-shrink-0 mt-5 sm:mt-15">
        <button
          onClick={() => navigateCard('right')}
          className="z-50 cursor-pointer border-[2px] border-[#101220] rounded-full px-8 py-4 text-[#101220] hover:bg-[#101220] hover:text-white transition-colors duration-300"
        >
          <GrLinkPrevious className="textl-xl sm:text-2xl" />
        </button>
        <span className="text-[#101220] text-lg font-body min-w-[80px] text-center">
          {currentCard + 1}/{cards.length}
        </span>
        <button
          onClick={() => navigateCard('left')}
          className="z-50 cursor-pointer border-[2px] border-[#101220] rounded-full px-8 py-4 text-[#101220] hover:bg-[#101220] hover:text-white transition-colors duration-300"
        >
          <GrLinkNext className="text-xl sm:text-2xl" />
        </button>
      </div>
      
      <style>{`
        @keyframes slideOutLeft {
          from { transform: translateX(0) scale(1); opacity: 1; }
          to { transform: translateX(-150%) scale(1.2); opacity: 0.5; }
        }
        
        @keyframes slideOutRight {
          from { transform: translateX(0) scale(1); opacity: 1; }
          to { transform: translateX(150%) scale(1.2); opacity: 0.5; }
        }
        
        @keyframes slideInFromLeft {
          from { transform: translateX(-150%) scale(1.2); opacity: 0.5; }
          to { transform: translateX(0) scale(1); opacity: 1; }
        }
        
        @keyframes slideInFromRight {
          from { transform: translateX(150%) scale(1.2); opacity: 0.5; }
          to { transform: translateX(0) scale(1); opacity: 1; }
        }
      `}</style>

      {showChatModal && currentCardForChat && (
        <ChatbotModal 
          showModal={showChatModal} 
          setShowModal={setShowChatModal}
          cardFront={currentCardForChat.front}
          cardBack={currentCardForChat.back}
          hasKeys={modalHasKeys}
          userProfilePic={userProfilePic} 
        />
      )}
    </div>
  );
};

export default BasicReview;