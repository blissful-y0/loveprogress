"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

// TODO: Replace with API data
const MINI_CAROUSEL_SLIDES = [
  {
    id: 1,
    image: "/img/main/중앙캐러셀.jpg",
    alt: "Phainaxa Wedding Cafe",
  },
  {
    id: 2,
    image: "/img/main/중앙캐러셀.jpg",
    alt: "Phainaxa Wedding Cafe 2",
  },
  {
    id: 3,
    image: "/img/main/중앙캐러셀.jpg",
    alt: "Phainaxa Wedding Cafe 3",
  },
];

const ICON_CARDS = [
  { id: 1, icon: "/img/main/topcarousel/학사일정.png", label: "학사일정" },
  { id: 2, icon: "/img/main/topcarousel/신입생안내.png", label: "신입생안내" },
  { id: 3, icon: "/img/main/topcarousel/예술교육원.png", label: "예술교육원" },
  { id: 4, icon: "/img/main/topcarousel/졸업수료.png", label: "졸업수료" },
  { id: 5, icon: "/img/main/topcarousel/대학원통합과정.png", label: "대학원통합과정" },
  { id: 6, icon: "/img/main/topcarousel/산학협력단.png", label: "산학협력단" },
];

export default function MiddleBanners() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-8 md:py-12">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* Mini carousel */}
        <div className="w-full lg:w-[260px] shrink-0">
          <Swiper
            modules={[Pagination]}
            spaceBetween={10}
            slidesPerView={1}
            pagination={{
              clickable: true,
              bulletActiveClass: "mini-bullet-active",
              bulletClass: "mini-bullet",
            }}
            className="mini-carousel"
          >
            {MINI_CAROUSEL_SLIDES.map((slide) => (
              <SwiperSlide key={slide.id}>
                <div className="relative w-full h-[100px] lg:w-[260px] lg:h-[100px] rounded-lg overflow-hidden">
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 260px"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom dot indicator styles */}
          <style jsx global>{`
            .mini-carousel .swiper-wrapper {
              padding-bottom: 24px;
            }
            .mini-carousel .swiper-pagination {
              bottom: 0 !important;
            }
            .mini-bullet {
              display: inline-block;
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background-color: #c0c0c0;
              margin: 0 3px;
              cursor: pointer;
            }
            .mini-bullet-active {
              display: inline-block;
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background-color: #505050;
              margin: 0 3px;
              cursor: pointer;
            }
          `}</style>
        </div>

        {/* Icon cards */}
        <div className="flex-1 w-full">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {ICON_CARDS.map((card) => (
              <button
                key={card.id}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="relative w-[48px] h-[48px] md:w-[56px] md:h-[56px]">
                  <Image
                    src={card.icon}
                    alt={card.label}
                    fill
                    className="object-contain"
                    sizes="56px"
                  />
                </div>
                <span className="text-xs md:text-sm text-text-dark whitespace-nowrap">
                  {card.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
