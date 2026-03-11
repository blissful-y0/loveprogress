"use client";

import { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";
import "swiper/css/pagination";

// TODO: Replace with API data
const BANNER_SLIDES = [
  {
    id: 1,
    image: "/img/main/main.jpg",
    backgroundColor: "#d6eaf8",
    alt: "메인 배너 1",
  },
  {
    id: 2,
    image: "/img/main/main.jpg",
    backgroundColor: "#f8d6d6",
    alt: "메인 배너 2",
  },
  {
    id: 3,
    image: "/img/main/main.jpg",
    backgroundColor: "#d6f8e0",
    alt: "메인 배너 3",
  },
  {
    id: 4,
    image: "/img/main/main.jpg",
    backgroundColor: "#f8f0d6",
    alt: "메인 배너 4",
  },
  {
    id: 5,
    image: "/img/main/main.jpg",
    backgroundColor: "#e0d6f8",
    alt: "메인 배너 5",
  },
];

export default function TopCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const currentBg = BANNER_SLIDES[activeIndex]?.backgroundColor ?? "#d6eaf8";

  const handleSlideChange = (swiper: SwiperType): void => {
    setActiveIndex(swiper.realIndex);
  };

  return (
    <section
      className="w-full transition-colors duration-500 py-6 md:py-10"
      style={{ backgroundColor: currentBg }}
    >
      <div className="relative mx-auto max-w-[1280px] px-4">
        <Swiper
          modules={[Pagination]}
          spaceBetween={20}
          slidesPerView={1}
          centeredSlides={true}
          loop={true}
          onSlideChange={handleSlideChange}
          breakpoints={{
            768: {
              slidesPerView: 1.1,
              spaceBetween: 24,
            },
            1280: {
              slidesPerView: 1.15,
              spaceBetween: 30,
            },
          }}
          className="top-carousel"
        >
          {BANNER_SLIDES.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className="relative h-[250px] md:h-[350px] lg:h-[450px] overflow-hidden rounded-[20px] md:rounded-[30px]">
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  className="object-cover"
                  priority={slide.id === 1}
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1280px"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Pagination indicator */}
        <div className="absolute bottom-10 right-8 md:bottom-12 md:right-12 z-10 flex items-center gap-1 rounded-full px-3 py-1 text-xs text-white"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.15)", height: "20px", minWidth: "45px" }}
        >
          <span className="text-[10px]">●</span>
          <span className="text-[10px]">
            {activeIndex + 1} / {BANNER_SLIDES.length}
          </span>
        </div>
      </div>
    </section>
  );
}
