"use client";

import React, { useState, useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { SwiperOptions } from "swiper/types";

export type CardCarouselProps<T> = {
  cards: T[];
  renderCard: (card: T, isActive: boolean) => React.ReactNode;
  breakpoints?: SwiperOptions["breakpoints"];
  onActiveChange?: (index: number) => void;
  enableLoop?: boolean;
};

export default function CardCarousel<T>({
  cards,
  renderCard,
  breakpoints,
  onActiveChange,
  enableLoop = true,
}: CardCarouselProps<T>) {
  const [activeIndex, setActiveIndex] = useState(0);
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevRef.current?.click();
      if (e.key === "ArrowRight") nextRef.current?.click();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="relative group w-full">
      {/* Previous Button */}
      <button
        ref={prevRef}
        aria-label="Previous"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 
          p-2 rounded-full bg-black/50 hover:bg-lime text-white 
          opacity-0 group-hover:opacity-100 transition cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Next Button */}
      <button
        ref={nextRef}
        aria-label="Next"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 
          p-2 rounded-full bg-black/50 hover:bg-lime text-white 
          opacity-0 group-hover:opacity-100 transition cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <Swiper
        modules={[Navigation, Keyboard]}
        navigation={{
          prevEl: prevRef.current ?? undefined,
          nextEl: nextRef.current ?? undefined,
        }}
        onBeforeInit={(swiper) => {
          // @ts-expect-error Swiper types are incorrect for dynamic nav assignment
          swiper.params.navigation.prevEl = prevRef.current;
          // @ts-expect-error Swiper types are incorrect for dynamic nav assignment
          swiper.params.navigation.nextEl = nextRef.current;
        }}
        breakpoints={breakpoints}
        centeredSlides
        loop={enableLoop}
        keyboard={{ enabled: true, onlyInViewport: true }}
        onSlideChange={(swiper) => {
          setActiveIndex(swiper.realIndex);
          onActiveChange?.(swiper.realIndex);
        }}
        {...(!breakpoints
          ? { slidesPerView: 1, spaceBetween: 12 }
          : { spaceBetween: 12 })}
      >
        {cards.map((card, index) => (
          <SwiperSlide key={index}>
            {renderCard(card, index === activeIndex)}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
