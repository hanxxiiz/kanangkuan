"use client";

import CardCarousel from '@/components/CardCarousel';
import { ModalContext } from '@/components/modals/providers';
import React, { useContext, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { triggerGenerationInBackground, checkWrongOptionsAndBlankWordsStatus } from '@/lib/actions/generate-qna-and-blank-words';
import { GetDeckCardCount } from '@/lib/queries/practice-queries';

interface PracticeModalProps {
  currentDeckId: string;
  onClose?: () => void; 
}

export default function PracticeModal({ currentDeckId, onClose }: PracticeModalProps) {
  const { Modal, setShowModal, showModal } = useContext(ModalContext); 
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const hasCalledOnClose = useRef(false); 
  const [wasOpen, setWasOpen] = useState(false);
  const [cardCount, setCardCount] = useState<number>(0);
  const [, setIsLoadingCount] = useState(true);
  const [isPipelineComplete, setIsPipelineComplete] = useState(false);
  const [, setIsCheckingPipeline] = useState(true);
  const [showInsufficientCardsError, setShowInsufficientCardsError] = useState(false);
  const pipelineCheckInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setShowModal(true);
    hasCalledOnClose.current = false;
    
    const checkPipelineStatus = async () => {
      if (!currentDeckId) return;
      
      try {
        const status = await checkWrongOptionsAndBlankWordsStatus(currentDeckId);
        
        if (status.success && !status.needsGeneration) {
          setIsPipelineComplete(true);
          setIsCheckingPipeline(false);
          
          if (pipelineCheckInterval.current) {
            clearInterval(pipelineCheckInterval.current);
            pipelineCheckInterval.current = null;
          }
        }
      } catch (error) {
        console.error("Error checking pipeline status:", error);
      }
    };
    
    if (currentDeckId) {
      triggerGenerationInBackground(currentDeckId);
      
      GetDeckCardCount(currentDeckId).then((count) => {
        setCardCount(count);
        setIsLoadingCount(false);
      });

      checkPipelineStatus();
      pipelineCheckInterval.current = setInterval(checkPipelineStatus, 2000);
    }
    
    return () => {
      setShowModal(false);
      if (pipelineCheckInterval.current) {
        clearInterval(pipelineCheckInterval.current);
      }
    };
  }, [setShowModal, currentDeckId]);

  useEffect(() => {
    if (showModal) {
      setWasOpen(true);
    }
    
    if (!showModal && wasOpen && !hasCalledOnClose.current && onClose) {
      hasCalledOnClose.current = true;
      onClose(); 
    }
  }, [showModal, wasOpen, onClose]);

  const practiceSlides = [
    {
      title: "Active Recall", 
      description: "Struggle a little, remember a lot — it's the good kind of brain sweat!", 
      image: "/active-recall.png",
      color: "bg-blue",
      path: `/dashboard/practice/active-recall/${currentDeckId}`,
      requiresPipeline: true,
    },
    {
      title: "Basic Review", 
      description: "Vibe with your notes, scroll, and let the info slowly click into place.", 
      image: "/basic-review.png",
      color: "bg-purple",
      path: `/dashboard/practice/basic-review/${currentDeckId}`,
      requiresPipeline: false,
    },
    {
      title: "Audio Player", 
      description: "Tune in and listen to your notes anytime, anywhere.", 
      image: "/audio-player.png",
      color: "bg-cyan",
      path: `/dashboard/practice/audio-player/${currentDeckId}`,
      requiresPipeline: false,
    },
    {
      title: "Active Recall", 
      description: "Struggle a little, remember a lot — it’s the good kind of brain sweat!", 
      image: "/active-recall.png",
      color: "bg-blue",
      path: `/dashboard/practice/active-recall/${currentDeckId}`,
    },
    {
      title: "Basic Review", 
      description: "Vibe with your notes, scroll, and let the info slowly click into place.", 
      image: "/basic-review.png",
      color: "bg-purple",
      path: `/dashboard/practice/basic-review/${currentDeckId}`,
    },
    {
      title: "Audio Player", 
      description: "Tune in and listen to your notes anytime, anywhere.", 
      image: "/audio-player.png",
      color: "bg-cyan",
      path: `/dashboard/practice/audio-player/${currentDeckId}`,
    },
  ];

  const handlePlay = () => {
    // Don't do anything if we can't play
    if (!canPlay) {
      if (cardCount < 5) {
        setShowInsufficientCardsError(true);
      }
      return;
    }
    
    const activeSlide = practiceSlides[activeIndex];
    
    if (activeSlide?.path) {
      setShowModal(false);

      const url = new URL(activeSlide.path, window.location.origin);
      url.searchParams.set("deckId", currentDeckId);
      
      if (activeSlide.title === "Active Recall") {
        router.push(`${activeSlide.path}?prepare=true`);
      } else {
        router.push(url.pathname + url.search);
      }
    }
  };

  const hasEnoughCards = cardCount >= 5;
  const activeSlide = practiceSlides[activeIndex];
  const requiresPipeline = activeSlide?.requiresPipeline;
  const canPlay = hasEnoughCards && (!requiresPipeline || isPipelineComplete);
  const isPreparingActiveRecall = practiceSlides.some(slide => slide.requiresPipeline) && !isPipelineComplete;
  
  // Button should be disabled if:
  // 1. Not enough cards, OR
  // 2. Currently on Active Recall and pipeline is not complete
  const isButtonDisabled = !hasEnoughCards || (requiresPipeline && !isPipelineComplete);

  return (
    <>
      {/* Add custom styles for disabled button state when canPlay is false */}
      {isButtonDisabled && (
        <style jsx global>{`
          .fixed.inset-0.z-50 button:last-child,
          .fixed.inset-0.z-50 .flex.justify-end button:last-child {
            opacity: 1 !important;
            cursor: not-allowed !important;
            pointer-events: all !important;
            background-color: rgb(107 114 128) !important;
          }
          .fixed.inset-0.z-50 button:last-child:hover,
          .fixed.inset-0.z-50 .flex.justify-end button:last-child:hover {
            background-color: rgb(107 114 128) !important;
            transform: none !important;
          }
        `}</style>
      )}
      <Modal
        heading="Practice"
        actionButtonText="Play"
        onAction={handlePlay}
      >
      <div className="w-full flex flex-col justify-center items-center">
        <div className="max-w-[900px] w-full mt-10">
          <CardCarousel
            cards={practiceSlides}
            breakpoints={{
              1920: { slidesPerView: 3, spaceBetween: 24 },
              1028: { slidesPerView: 2, spaceBetween: 16 },
              640: { slidesPerView: 1, spaceBetween: 12 },
            }}
            onActiveChange={setActiveIndex} 
            renderCard={(card, isActive) => (
              <div
                className={`border-1 rounded-2xl overflow-hidden transition-all duration-300 ${
                  isActive ? "scale-100 shadow-xl" : "scale-90 opacity-60"
                } ${card.color}`}
                style={{ width: "250px" }}
              >
                <div className="w-full p-4 flex flex-col items-center justify-center">
                  <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-white shadow-sm">
                    <Image
                      src={card.image} 
                      alt={card.title}
                      className="w-full h-full object-cover border-1 rounded-xl"
                      width={250}
                      height={333}
                    />
                  </div>
                  <div className="justify-left m-2">
                    <h3 className="text-2xl font-semibold font-main text-white">
                      {card.title}
                    </h3>
                  </div>
                </div>
              </div>
            )}
          />
        </div>
        
        {/* Loader indicator for preparing state - positioned below carousel, persists regardless of active card */}
        {isPreparingActiveRecall && (
          <div className="flex items-center justify-center gap-2 mt-6 mb-2 text-gray-600">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Preparing questions...</span>
          </div>
        )}
        
        {/* Error message for insufficient cards - only shows after clicking Play */}
        {showInsufficientCardsError && !hasEnoughCards && (
          <div className="sm:-mt-7 px-10 sm:px-18 py-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-medium text-center">
              You need at least 5 cards in this deck to practice.
            </p>
          </div>
        )}
      </div>
    </Modal>
    </>
  );
}