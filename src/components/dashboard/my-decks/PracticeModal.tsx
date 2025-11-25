"use client";

import CardCarousel from '@/components/CardCarousel';
import { ModalContext } from '@/components/modals/providers';
import React, { useContext, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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

  useEffect(() => {
    setShowModal(true);
    hasCalledOnClose.current = false;
    
    return () => {
      setShowModal(false);
    };
  }, [setShowModal]); 

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
    {
      title: "Challenge", 
      description: "Go head-to-head with friends in real-time brain duels—fierce, and fun!", 
      image: "/challenge.png",
      color: "bg-pink",
      path: "/dashboard/games/challenge",
    },
    {
      title: "Lumbaanay", 
      description: "It’s a study showdown! Race your barkada in real-time to see who’s the true quiz champ!", 
      image: "/lumbaanay.png",
      color: "bg-lime",
      path: "/dashboard/games/lumbaanay",
    }
  ];

  const handlePlay = () => {
    const activeSlide = practiceSlides[activeIndex];
    if (activeSlide?.path) {
      setShowModal(false);
      
      if (activeSlide.title === "Active Recall") {
        router.push(`${activeSlide.path}?prepare=true`);
      } else {
        router.push(activeSlide.path);
      }
    }
  };

  return (
    <Modal
      heading="Practice"
      actionButtonText="Play"
      onAction={handlePlay}
    >
      <div className="w-full flex justify-center">
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
      </div>
    </Modal>
  );
}
