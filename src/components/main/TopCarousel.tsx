"use client";

import { useState } from "react";
/* eslint-disable @next/next/no-img-element */
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import type { MainBannerRow } from "@/types/database";

import "swiper/css";
import "swiper/css/pagination";

// Fallback banners when no DB banners exist
const FALLBACK_SLIDES = [
  { id: "f1", image: "/img/main/main.jpg", backgroundColor: "#2c3e6b", alt: "메인 배너 1", link: "" },
  { id: "f2", image: "/img/main/main2.jpg", backgroundColor: "#e56f6f", alt: "메인 배너 2", link: "" },
  { id: "f3", image: "/img/main/main3.jpg", backgroundColor: "#9fc148", alt: "메인 배너 3", link: "" },
];

interface TopCarouselProps {
  banners?: MainBannerRow[];
}

export default function TopCarousel({ banners }: TopCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [ready, setReady] = useState(false);

  const slides = banners && banners.length > 0
    ? banners.map((b) => ({
        id: b.id,
        image: b.image_key,
        backgroundColor: b.bg_color ?? "transparent",
        alt: `배너 ${b.sort_order + 1}`,
        link: b.link_url ?? "",
      }))
    : FALLBACK_SLIDES;

  const currentBg = slides[activeIndex]?.backgroundColor ?? "transparent";

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
            {slides.map((slide) => (
              <SwiperSlide key={slide.id}>
                <div className="relative overflow-hidden rounded-2xl md:rounded-[30px]">
                  {slide.link ? (
                    <a href={slide.link} target="_blank" rel="noopener noreferrer">
                      <img
                        src={slide.image}
                        alt={slide.alt}
                        width={1280}
                        height={450}
                        className="w-full h-auto"
                      />
                    </a>
                  ) : (
                    <img
                      src={slide.image}
                      alt={slide.alt}
                      width={1280}
                      height={450}
                      className="w-full h-auto"
                    />
                  )}
                  {/* Pagination indicator - overlay on image */}
                  <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4">
                    <div className="flex items-center gap-1 px-3 py-1 text-white"
                      style={{ backgroundColor: "rgba(0, 0, 0, 0.15)", height: "20px", minWidth: "45px", borderRadius: "10px" }}
                    >
                      <span className="text-[12px] font-medium">●</span>
                      <span className="text-[12px] font-medium">
                        {activeIndex + 1} / {slides.length}
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
