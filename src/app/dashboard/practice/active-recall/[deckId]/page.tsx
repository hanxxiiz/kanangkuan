"use client";

import { useState, useContext, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PracticeDataContext } from '@/components/dashboard/practice/PracticeLayout';
import { ActiveRecallCard } from '@/lib/queries/active-recall-queries';
import ProgressBar from '@/components/dashboard/practice/active-recall/ProgressBar';
import ActiveRecallInterface from '@/components/dashboard/practice/active-recall/ActiveRecallInterface';
import SuccessModal from '@/components/dashboard/practice/active-recall/SuccessModal';
import OutOfLivesModal from '@/components/dashboard/practice/active-recall/OutOfLivesModal';
import { toast } from "sonner";
import { FaLightbulb } from "react-icons/fa6";
import Image from 'next/image';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface CardWithState extends ActiveRecallCard {
  failCount: number;
}

interface DelayedCard {
  card: CardWithState;
  countdown: number;
}

// ============================================================================
// QUEUE MANAGEMENT UTILITIES
// ============================================================================

/**
 * Determines how many cards to wait before retrying based on fail count
 * failCount 1 → 3 cards wait
 * failCount 2 → 2 cards wait  
 * failCount ≥3 → 1 card wait
 */
function getRetryDelay(failCount: number): number {
  if (failCount === 1) return 3;
  if (failCount === 2) return 2;
  return 1; // failCount >= 3
}

/**
 * Processes delayed queue after showing a card:
 * - Decrements all countdowns
 * - Moves cards with countdown=0 back to main queue
 */
function processDelayedQueue(
  delayedQueue: DelayedCard[],
  mainQueue: CardWithState[]
): { newDelayed: DelayedCard[]; newMain: CardWithState[] } {
  const readyCards: CardWithState[] = [];
  const stillDelayed: DelayedCard[] = [];

  delayedQueue.forEach(item => {
    const newCountdown = item.countdown - 1;
    if (newCountdown <= 0) {
      readyCards.push(item.card);
    } else {
      stillDelayed.push({ ...item, countdown: newCountdown });
    }
  });

  // Add ready cards to front of main queue
  return {
    newDelayed: stillDelayed,
    newMain: [...readyCards, ...mainQueue]
  };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ActiveRecallPage({ 
  params 
}: { 
  params: Promise<{ deckId: string }> 
}) {
  const router = useRouter();
  const initialData = useContext(PracticeDataContext);
  
  // Queue state
  const [mainQueue, setMainQueue] = useState<CardWithState[]>([]);
  const [delayedQueue, setDelayedQueue] = useState<DelayedCard[]>([]);
  const [completedCards, setCompletedCards] = useState<Set<string>>(new Set());
  
  // UI state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showOutOfLivesModal, setShowOutOfLivesModal] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [totalXpEarned, setTotalXpEarned] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(0);
  const [livesLeft, setLivesLeft] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [canContinue, setCanContinue] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  
  // Ref to track previous card ID
  const previousCardIdRef = useRef<string | null>(null);

  
  // Initialize hints and lives from context
  useEffect(() => {
    if (initialData?.dailyLimits) {
      setHintsLeft(initialData.dailyLimits.hints_left);
      setLivesLeft(initialData.dailyLimits.lives_left);
    }
  }, [initialData]);

  // Initialize queues with cards from context
  useEffect(() => {
    if (initialData?.cards && initialData.cards.length > 0) {
      const cardsWithState: CardWithState[] = (initialData.cards as ActiveRecallCard[]).map(card => ({
        ...card,
        failCount: 0
      }));
      setMainQueue(cardsWithState);
    }
  }, [initialData?.cards]);

  const currentCard = mainQueue[0];
  const totalCards = initialData?.cards?.length || 0;
  const deckColor = initialData?.deckColor || "lime";

   // Reset card-specific state when current card changes
  useEffect(() => {
    if (currentCard) {
      // Check if card actually changed
      const cardChanged = previousCardIdRef.current !== null && previousCardIdRef.current !== currentCard.id;
      
      if (cardChanged) {
        // Card changed - set animation immediately to prevent flash
        setShouldAnimate(true);
        
        // Reset everything else
        setIsRevealed(false);
        setIsCorrect(false);
        setCanContinue(false);
        setShouldShake(false);
        
        // Reset animation flag after animation completes
        setTimeout(() => setShouldAnimate(false), 450);
      } else if (previousCardIdRef.current !== null) {
        // Same card (wrong answer) - explicitly no animation
        setShouldAnimate(false);
      }
      
      previousCardIdRef.current = currentCard.id;
    }
  }, [currentCard?.id]);

  // Enable continue after reveal OR correct answer
  useEffect(() => {
    if (isRevealed || isCorrect) {
      const timer = setTimeout(() => {
        setCanContinue(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isRevealed, isCorrect]);

  // ============================================================================
  // EVENT HANDLERS - MUST BE DEFINED BEFORE KEYBOARD/CLICK EFFECT
  // ============================================================================

  const handleReturnToDeck = async () => {
    const resolvedParams = await params;
    router.push(`/dashboard/my-decks/${resolvedParams.deckId}`);
  };

  const handleCorrectAnswer = (xp: number) => {
  setIsCorrect(true);
  setXpEarned(xp);
  setTotalXpEarned(prev => prev + xp);
  
  // Reset isRevealed immediately when answering correctly
  setIsRevealed(false);  // 👈👈👈 ADD THIS LINE HERE!!!
  
  // Mark card as completed
  const newCompleted = new Set(completedCards);
  newCompleted.add(currentCard.id);
  setCompletedCards(newCompleted);

  // 🔥 RESET failCount when answered correctly
  const updatedQueue = [...mainQueue];
  updatedQueue[0] = { ...updatedQueue[0], failCount: 0 };
  setMainQueue(updatedQueue);

  setShowSuccessModal(true);
  // Check if session is complete
  if (newCompleted.size === totalCards) {
    // Check if there are any delayed cards
    if (delayedQueue.length === 0 && mainQueue.length === 1) {
      setTimeout(() => handleReturnToDeck(), 2000);
    }
  }
};

  const handleWrongAnswer = () => {
  const newLivesLeft = livesLeft - 1;
  setLivesLeft(newLivesLeft);
  
  if (newLivesLeft <= 0) {
    setShowOutOfLivesModal(true);
    return;
  }

  // ADD THIS LINE HERE 👇
  setShouldAnimate(false);

  // Increment fail count on the current card (without changing card ID)
  const updatedQueue = [...mainQueue];
  updatedQueue[0] = { ...updatedQueue[0], failCount: updatedQueue[0].failCount + 1 };
  setMainQueue(updatedQueue);
  
  // Trigger shake animation
  setShouldShake(true);
  setTimeout(() => setShouldShake(false), 500);
};

  const handleReveal = () => {
    // Decrement lives for revealing
    const newLivesLeft = livesLeft - 1;
    setLivesLeft(newLivesLeft);
    
    if (newLivesLeft <= 0) {
      setShowOutOfLivesModal(true);
      return;
    }

    setIsRevealed(true);
    
    // DON'T process queue yet - wait for user to continue
    // Queue will be processed when user taps/presses key
  };

  const handleUseHint = () => {
    if (hintsLeft > 0) {
      setHintsLeft(hintsLeft - 1);
      return true;
    }
    
    const bgColor = `var(--color-${deckColor})`;
    
    toast("Out of hints!", {
      description: "You've used all your hints for today.",
      icon: <FaLightbulb className="text-[#FEEF69] text-2xl" />,
      className: "border-2 border-black",
      classNames: {
        title: "font-main !text-lg !text-white",
        description: "!font-regular !text-md !text-white",
      },
      style: {
        background: bgColor,
        color: "#fff",
      },
    });
    return false;
  };

  const handleSuccessClose = () => {
  setShowSuccessModal(false);
  
  const hadPreviousFails = currentCard.failCount > 0;
  
  // Remove from main queue
  const newMainQueue = mainQueue.slice(1);
  
  // Process delayed queue first
  const { newDelayed, newMain } = processDelayedQueue(delayedQueue, newMainQueue);
  
  if (hadPreviousFails) {
    // Card had fails - add to delayed queue based on fail count
    const retryDelay = getRetryDelay(currentCard.failCount);
    const updatedDelayed = [...newDelayed, { card: currentCard, countdown: retryDelay }];
    
    setDelayedQueue(updatedDelayed);
    setMainQueue(newMain);
  } else {
    // Card had no fails - remove completely
    setDelayedQueue(newDelayed);
    setMainQueue(newMain);
  }
};

  // ============================================================================
  // KEYBOARD/CLICK HANDLING FOR CONTINUE
  // ============================================================================

  useEffect(() => {
    // ONLY enable continue when:
    // 1. Either revealed OR correct
    // 2. Can continue (delay passed)
    // 3. Modal is NOT showing (for correct answers, wait for modal to close)
    if (!(isRevealed || isCorrect) || !canContinue || showSuccessModal) return;

  const handleInteraction = async () => {
  if (isRevealed) {
    // Process queue change WITHOUT resetting isRevealed yet
    const failedCard = { ...currentCard, failCount: 3 };
    const retryDelay = getRetryDelay(3);
    const newMainQueue = mainQueue.slice(1);
    const { newDelayed, newMain } = processDelayedQueue(delayedQueue, newMainQueue);
    const updatedDelayed = [...newDelayed, { card: failedCard, countdown: retryDelay }];
    
    setDelayedQueue(updatedDelayed);
    setMainQueue(newMain);
    
    // WAIT for next render cycle, THEN reset
    requestAnimationFrame(() => {
      setIsRevealed(false);
    });
  } else {
    setIsCorrect(false);
  }
  
  if (mainQueue.length === 0 && delayedQueue.length === 0) {
    await handleReturnToDeck();
  }
};

    const handleKeyPress = (e: KeyboardEvent) => {
      e.preventDefault();
      handleInteraction();
    };

    const handleClick = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      handleInteraction();
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('click', handleClick);
    window.addEventListener('touchstart', handleClick);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('touchstart', handleClick);
    };
  }, [isRevealed, isCorrect, canContinue, showSuccessModal, mainQueue.length, delayedQueue.length]);

  // ============================================================================
  // EARLY RETURNS - AFTER ALL HOOKS
  // ============================================================================

  // Let PracticeLayout handle the loading state
  if (!initialData) {
    return null;
  }

  if (!initialData.cards || initialData.cards.length === 0) {
    return (
      <div className="min-h-screen bg-white p-10 sm:p-5 flex items-center justify-center">
        <div className="text-xl">No cards available for review</div>
      </div>
    );
  }

  // Safety check for currentCard
  if (!currentCard) {
    return (
      <div className="min-h-screen bg-white p-10 sm:p-5 flex items-center justify-center">
        <div className="text-xl">Loading card...</div>
      </div>
    );
  }

  // Determine if we should animate (only when card ID actually changed from a previous card)
  // This is now managed in state via the useEffect above

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-white p-10 sm:p-5">
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slideUp 0.4s ease-out forwards;     
        }
        .card-container {
          opacity: 1;
        }
      `}</style>

      <div className="max-w-4xl mx-auto">
        <ProgressBar 
          current={completedCards.size} 
          total={totalCards} 
          deckColor={deckColor} 
        />

<div className={`card-container ${shouldAnimate && !isRevealed ? "animate-slide-up" : ""}`}>            <ActiveRecallInterface 
              card={currentCard}
              hintsLeft={hintsLeft}
              livesLeft={livesLeft}
              deckColor={deckColor} 
              onCorrectAnswer={handleCorrectAnswer}
              onWrongAnswer={handleWrongAnswer}
              onUseHint={handleUseHint}
              onReveal={handleReveal}
              isRevealed={isRevealed}
              shouldShake={shouldShake}
              shouldAnimate={shouldAnimate}
            />
        </div>

        <SuccessModal
          isOpen={showSuccessModal}
          xpEarned={xpEarned}
          onClose={handleSuccessClose}
          autoCloseDelay={1500} 
        />

        <OutOfLivesModal
          isOpen={showOutOfLivesModal}
          onReturnToDeck={handleReturnToDeck}
        />
      </div>

      {isRevealed && !isCorrect && (
        <div className="fixed bottom-0 left-0 right-0 bg-black border-t-1 border-gray-200 py-8">
          <div className="flex items-center justify-center gap-3">
            <Image 
              src="/practice/active-recall-mascot.svg" 
              alt="Mascot" 
              width={30} 
              height={30}
              className="w-15 h-15"
            />
            <p className="text-center text-white text-md font-main">
              ⚠️ Tap or press any key to continue...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}