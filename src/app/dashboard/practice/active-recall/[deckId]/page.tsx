"use client";

import { useState, useContext, useEffect, useRef, useCallback } from 'react';
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
import SummaryReport from '@/components/dashboard/practice/active-recall/SummaryReport';
import {
  DecrementHints,
  DecrementLives,
  AddXPTransaction
} from '@/lib/actions/active-recall-actions';
import StylishLoader from '@/components/ui/StylishLoader';

interface CardWithState extends ActiveRecallCard {
  failCount: number;
  hasBeenAnswered: boolean; 
}

interface DelayedCard {
  card: CardWithState;
  countdown: number;
}

/**
 * Determines how many cards to wait before retrying based on fail count
 */
function getRetryDelay(failCount: number): number {
  if (failCount === 1) return 3;
  if (failCount === 2) return 2;
  return 1;
}

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

  // CRITICAL: If main queue will be empty after this, force ALL delayed cards back
  // This prevents getting stuck with no cards to show
  if (mainQueue.length === 0 && stillDelayed.length > 0) {
    const allCards = [...readyCards, ...stillDelayed.map(d => d.card)];
    return {
      newDelayed: [],
      newMain: allCards
    };
  }

  // Add ready cards to front of main queue
  return {
    newDelayed: stillDelayed,
    newMain: [...readyCards, ...mainQueue]
  };
}

export default function ActiveRecallPage({
  params
}: {
  params: Promise<{ deckId: string }>
}) {
  const router = useRouter();
  const initialData = useContext(PracticeDataContext);
  const hasInitializedRef = useRef(false);

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

  const [firstAttemptsCount, setFirstAttemptsCount] = useState(0);
  const [reattemptsCount, setReattemptsCount] = useState(0);
  const [showSummaryReport, setShowSummaryReport] = useState(false);

  // Ref to track previous card ID for animation logic
  const previousCardIdRef = useRef<string | null>(null);

  // Preload audio files
  const correctAudioRef = useRef<HTMLAudioElement | null>(null);
  const wrongAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioLoadedRef = useRef({ correct: false, wrong: false });

  useEffect(() => {
    // Preload sounds on component mount
    const loadAudio = () => {
      try {
        correctAudioRef.current = new Audio('/practice/correct.mp3');
        wrongAudioRef.current = new Audio('/practice/wrong.mp3');
        
        // Wait for audio to be loaded before marking as ready
        correctAudioRef.current.addEventListener('canplaythrough', () => {
          audioLoadedRef.current.correct = true;
        });
        
        wrongAudioRef.current.addEventListener('canplaythrough', () => {
          audioLoadedRef.current.wrong = true;
        });
        
        correctAudioRef.current.addEventListener('error', () => {
          correctAudioRef.current = null;
        });
        
        wrongAudioRef.current.addEventListener('error', () => {
          wrongAudioRef.current = null;
        });
        
        // Preload the audio files
        correctAudioRef.current.load();
        wrongAudioRef.current.load();
      } catch {
        correctAudioRef.current = null;
        wrongAudioRef.current = null;
      }
    };
    
    loadAudio();
  }, []);


  // Initialize hints and lives from context
  useEffect(() => {
    if (initialData?.dailyLimits) {
      setHintsLeft(initialData.dailyLimits.hints_left);
      setLivesLeft(initialData.dailyLimits.lives_left);
    }
  }, [initialData]);

  // CHECK IF USER HAS NO LIVES AT START - Show modal immediately
  useEffect(() => {
    if (initialData?.dailyLimits && initialData.dailyLimits.lives_left <= 0) {
      setShowOutOfLivesModal(true);
    }
  }, [initialData]);

  // Initialize queues with cards from context
  useEffect(() => {
    if (initialData?.cards && initialData.cards.length > 0) {

      hasInitializedRef.current = true;

      const cardsWithState: CardWithState[] = (initialData.cards as ActiveRecallCard[]).map(card => ({
        ...card,
        failCount: 0,
        hasBeenAnswered: false
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
      const cardChanged = previousCardIdRef.current !== null && previousCardIdRef.current !== currentCard.id;

      if (cardChanged) {
        // Card changed - set animation immediately to prevent flash
        setShouldAnimate(true);

        // Reset everything else
        setIsRevealed(false);
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
  }, [currentCard]);

  // Enable continue after reveal OR correct answer
  useEffect(() => {
    if (isRevealed || isCorrect) {
      const timer = setTimeout(() => {
        setCanContinue(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isRevealed, isCorrect]);

  // Check if session is complete
  useEffect(() => {
    if (completedCards.size === totalCards && mainQueue.length === 0 && delayedQueue.length === 0) {
      // Save total XP to database when session completes
      if (totalXpEarned > 0) {
        AddXPTransaction(totalXpEarned).then(result => {
          if (!result.success) {
            console.error("Failed to save XP:", result.error);
          }
        });
      }
      
      setShowSummaryReport(true);
    }
  }, [completedCards.size, mainQueue.length, delayedQueue.length, totalCards, totalXpEarned]);

  const handleReturnToDeck = async () => {
    const resolvedParams = await params;
    router.push(`/dashboard/my-decks/${resolvedParams.deckId}`);
  };

  const handleCorrectAnswer = async (xp: number) => {
    
    // Only play if audio is loaded
    try {
      if (correctAudioRef.current && audioLoadedRef.current.correct) {
        correctAudioRef.current.currentTime = 0;
        await correctAudioRef.current.play();
      }
    } catch {
      // Silently ignore audio errors
    }

    setIsCorrect(true);
    setXpEarned(xp);
    setTotalXpEarned(prev => prev + xp);

    // Only count stats when marking card as completed (failCount === 0)
    // This ensures each card is only counted once in the stats
    if (currentCard.failCount === 0) {
      // Track first attempt vs reattempt based on hasBeenAnswered flag
      if (!currentCard.hasBeenAnswered) {
        // Never been answered before = first attempt success
        setFirstAttemptsCount(prev => prev + 1);
      } else {
        // Has been answered before (had wrong attempts) = reattempt success
        setReattemptsCount(prev => prev + 1);
      }
      
      // Mark card as completed
      const newCompleted = new Set(completedCards);
      newCompleted.add(currentCard.id);
      setCompletedCards(newCompleted);
    }

    setShowSuccessModal(true);
  };

  const handleWrongAnswer = async () => {
    // Only play if audio is loaded
    try {
      if (wrongAudioRef.current && audioLoadedRef.current.wrong) {
        wrongAudioRef.current.currentTime = 0;
        await wrongAudioRef.current.play();
      }
    } catch {
      // Silently ignore audio errors
    }

    // PREVENT DECREMENT IF ALREADY AT 0
    if (livesLeft <= 0) {
      setShowOutOfLivesModal(true);
      return;
    }

    // Update UI immediately (optimistic update)
    const newLivesLeft = livesLeft - 1;
    setLivesLeft(newLivesLeft);

    if (newLivesLeft <= 0) {
      setShowOutOfLivesModal(true);
      
      // Update database in background
      DecrementLives().then(result => {
        if (!result.success) {
          console.error("Failed to decrement lives:", result.error);
        }
      });
      return;
    }

    setShouldAnimate(false);

    /// Increment fail count and mark as answered
    const updatedQueue = [...mainQueue];
    updatedQueue[0] = { 
      ...updatedQueue[0], 
      failCount: updatedQueue[0].failCount + 1,
      hasBeenAnswered: true 
    };
    setMainQueue(updatedQueue);

    // Trigger shake animation
    setShouldShake(true);
    setTimeout(() => setShouldShake(false), 500);

    // Update database in background (fire and forget)
    DecrementLives().then(result => {
      if (!result.success) {
        console.error("Failed to decrement lives:", result.error);
      } else if (result.newValue !== undefined) {
        // Sync with actual DB value to be safe
        setLivesLeft(result.newValue);
      }
    });
  };

  const handleReveal = () => {
    // PREVENT DECREMENT IF ALREADY AT 0
    if (livesLeft <= 0) {
      setShowOutOfLivesModal(true);
      return;
    }

    // Update UI immediately
    const newLivesLeft = livesLeft - 1;
    setLivesLeft(newLivesLeft);

    if (newLivesLeft <= 0) {
      setShowOutOfLivesModal(true);

      // Update database in background
      DecrementLives().then(result => {
        if (!result.success) {
          console.error("Failed to decrement lives:", result.error);
        }
      });
      return;
    }

    // Update database in background (fire and forget)
    DecrementLives().then(result => {
      if (!result.success) {
        console.error("Failed to decrement lives:", result.error);
      } else if (result.newValue !== undefined) {
        // Sync with actual DB value to be safe
        setLivesLeft(result.newValue);
      }
    });

    setIsRevealed(true);

    // Track as reattempt
    setReattemptsCount(prev => prev + 1);

   // Set fail count to 3 and mark as answered
    const updatedQueue = [...mainQueue];
    updatedQueue[0] = { 
      ...updatedQueue[0], 
      failCount: 3,
      hasBeenAnswered: true 
    };
    setMainQueue(updatedQueue);
  };

  const handleUseHint = () => {
    if (hintsLeft > 0) {
      // Update UI immediately
      setHintsLeft(hintsLeft - 1);

      // Update database in background (fire and forget)
      DecrementHints().catch(() => {
        // Silently handle errors - UI already updated optimistically
      });

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

  const handleSuccessClose = useCallback(() => {
    const hadPreviousFails = currentCard.failCount > 0;
    const wasRevealed = isRevealed;
    const wasCorrect = isCorrect;

    setShowSuccessModal(false);

    // Remove current card from main queue
    const newMainQueue = mainQueue.slice(1);

    // First, process the existing delayed queue to decrement countdowns
    // (because we're showing a new card now)
    const { newDelayed: processedDelayed, newMain: processedMain } = processDelayedQueue(delayedQueue, newMainQueue);

    if (wasRevealed) {
      // Revealed cards go back with countdown of 1 and RESET failCount
      const cardWithResetFailCount = { ...currentCard, failCount: 0 };
      
      // Add to the already-processed delayed queue
      const updatedDelayed = [...processedDelayed, { card: cardWithResetFailCount, countdown: 1 }];
      
      // Check if main queue is empty after processing
      if (processedMain.length === 0 && updatedDelayed.length > 0) {
        // Force all delayed cards back immediately
        setDelayedQueue([]);
        setMainQueue(updatedDelayed.map(d => d.card));
      } else {
        setDelayedQueue(updatedDelayed);
        setMainQueue(processedMain);
      }
    } else if (wasCorrect && hadPreviousFails) {
      // Correct answer but had reattempts - send back with RESET failCount
      const retryDelay = getRetryDelay(currentCard.failCount);
      const cardWithResetFailCount = { ...currentCard, failCount: 0 };
      
      // Add to the already-processed delayed queue
      const updatedDelayed = [...processedDelayed, { card: cardWithResetFailCount, countdown: retryDelay }];
      
      // Check if main queue is empty after processing
      if (processedMain.length === 0 && updatedDelayed.length > 0) {
        // Force all delayed cards back immediately
        setDelayedQueue([]);
        setMainQueue(updatedDelayed.map(d => d.card));
      } else {
        setDelayedQueue(updatedDelayed);
        setMainQueue(processedMain);
      }
    } else {
      // first-try correct answer - just use processed queues
      setDelayedQueue(processedDelayed);
      setMainQueue(processedMain);
    }

    // Reset states
    setIsCorrect(false);
    setIsRevealed(false);
  }, [currentCard, isRevealed, isCorrect, mainQueue, delayedQueue]);
  
  const handleRetry = () => {
    // Reset all state to restart the practice session
    setCompletedCards(new Set());
    setShowSummaryReport(false);
    setTotalXpEarned(0);
    setFirstAttemptsCount(0);
    setReattemptsCount(0);
    setIsRevealed(false);
    setIsCorrect(false);
    setCanContinue(false);
    setShouldShake(false);
    setShouldAnimate(false);
    setShowSuccessModal(false);
    
    // Reinitialize the queues with fresh cards AND shuffle them
    if (initialData?.cards && initialData.cards.length > 0) {
      const cardsWithState: CardWithState[] = (initialData.cards as ActiveRecallCard[]).map(card => ({
        ...card,
        failCount: 0,
        hasBeenAnswered: false
      }));
      
      // Shuffle the cards using Fisher-Yates algorithm
      const shuffled = [...cardsWithState];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      setMainQueue(shuffled);
      setDelayedQueue([]);
    }
    
    // Reset the previous card ref
    previousCardIdRef.current = null;
  };


  // KEYBOARD/CLICK HANDLING FOR CONTINUE
  useEffect(() => {
    if ((isCorrect || isRevealed) && !showSuccessModal && canContinue) {
      const handleInteraction = () => {
        handleSuccessClose();
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
    }
  }, [isCorrect, isRevealed, showSuccessModal, canContinue, handleSuccessClose]);

  // EARLY RETURNS
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

  // Show summary report if session is complete
  if (showSummaryReport) {
    return (
      <div className="h-[800px]  bg-white p-10 sm:p-5">
        <SummaryReport
          totalXpEarned={totalXpEarned}
          itemsCompleted={completedCards.size}
          firstAttempts={firstAttemptsCount}
          reattempts={reattemptsCount}
          deckColor={deckColor}
          onClose={handleReturnToDeck}
          onRetry={handleRetry}  
        />
      </div>
    );
  }

  // Safety check for currentCard
  if (!currentCard) {
    return (
      <StylishLoader />
    );
  }

  // RENDER
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

        <div className={`card-container ${shouldAnimate && !isRevealed ? "animate-slide-up" : ""}`}>
          <ActiveRecallInterface
            card={currentCard}
            hintsLeft={hintsLeft}
            livesLeft={livesLeft}
            deckColor={deckColor}
            onCorrectAnswer={handleCorrectAnswer}
            onWrongAnswer={handleWrongAnswer}
            onUseHint={handleUseHint}
            onReveal={handleReveal}
            isRevealed={isRevealed}
            isCorrect={isCorrect}
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

      {/* Continue prompt displayed after correct answer and before SuccessModal closes */}
      {isRevealed && !showSuccessModal && canContinue && (
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
              Tap or press any key to continue...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}