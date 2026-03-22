"use client";

import { useState } from "react";
/* eslint-disable @next/next/no-img-element */
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";
import "swiper/css/pagination";

// TODO: Replace with API data
const BANNER_SLIDES = [
  {
    id: 1,
    image: "/img/main/main.jpg",
    backgroundColor: "#2c3e6b",
    alt: "메인 배너 1",
  },
  {
    id: 2,
    image: "/img/main/main2.jpg",
    backgroundColor: "#e56f6f",
    alt: "메인 배너 2",
  },
  {
    id: 3,
    image: "/img/main/main3.jpg",
    backgroundColor: "#9fc148",
    alt: "메인 배너 3",
  },
];

export default function TopCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const currentBg = BANNER_SLIDES[activeIndex]?.backgroundColor ?? "transparent";

  const handleSlideChange = (swiper: SwiperType): void => {
    setActiveIndex(swiper.realIndex);
  };

  return (
    <section className="relative w-full pt-[30px] pb-4 md:pb-6">
      {/* Background color - top half only */}
      <div
        className="absolute top-0 left-0 w-full h-[85%] transition-colors duration-500"
        style={{ backgroundColor: currentBg }}
      />
      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-4 md:px-6 lg:px-8">
        <div
          className="w-full transition-opacity duration-300"
          style={{ opacity: ready ? 1 : 0 }}
        >
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            centeredSlides={true}
            loop={true}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            onSwiper={() => setReady(true)}
            onSlideChange={handleSlideChange}
            breakpoints={{
              768: {
                slidesPerView: 1,
                spaceBetween: 24,
                centeredSlides: false,
              },
              1280: {
                slidesPerView: 1,
                spaceBetween: 30,
                centeredSlides: false,
              },
            }}
            className="top-carousel"
          >
            {BANNER_SLIDES.map((slide) => (
              <SwiperSlide key={slide.id}>
                <div className="relative overflow-hidden rounded-2xl md:rounded-[30px]">
                  <img
                    src={slide.image}
                    alt={slide.alt}
                    width={1280}
                    height={450}
                    className="w-full h-auto"
                  />
                  {/* Pagination indicator - overlay on image */}
                  <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4">
                    <div className="flex items-center gap-1 px-3 py-1 text-white"
                      style={{ backgroundColor: "rgba(0, 0, 0, 0.15)", height: "20px", minWidth: "45px", borderRadius: "10px" }}
                    >
                      <span className="text-[12px] font-medium">●</span>
                      <span className="text-[12px] font-medium">
                        {activeIndex + 1} / {BANNER_SLIDES.length}
                      </span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

      </div>
    </section>
  );
}
