"use client";

import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";

type CardCarouselProps<T> = {
  cards: T[];
  renderCard: (card: T, isActive: boolean, index: number) => React.ReactNode;
  breakpoints?: Record<number, { slidesPerView: number; spaceBetween?: number }>;
};

export default function CardCarousel<T>({
  cards,
  renderCard,
  breakpoints,
}: CardCarouselProps<T>) {
  const swiperRef = useRef<SwiperType | null>(null);

  const handleCardClick = (index: number) => {
    if (swiperRef.current) {
      swiperRef.current.slideToLoop(index);
    }
  };

  return (
    <Swiper
      onSwiper={(swiper) => (swiperRef.current = swiper)}
      centeredSlides={true}
      breakpoints={breakpoints}
      slideToClickedSlide={true}
      className="!overflow-visible"
    >
      {cards.map((card, idx) => (
        <SwiperSlide key={idx} className="!h-auto">
          {({ isActive }) => (
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick(idx);
              }}
              className="cursor-pointer"
            >
              {renderCard(card, isActive, idx)}
            </div>
          )}
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
