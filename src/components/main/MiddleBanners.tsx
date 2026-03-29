"use client";

/* eslint-disable @next/next/no-img-element */
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

// TODO: Replace with API data
const MINI_CAROUSEL_SLIDES = [
  { id: 1, image: "/img/main/middle-carousel.jpg", alt: "Phainaxa Wedding Cafe" },
  { id: 2, image: "/img/main/middle-carousel.jpg", alt: "Phainaxa Wedding Cafe 2" },
  { id: 3, image: "/img/main/middle-carousel.jpg", alt: "Phainaxa Wedding Cafe 3" },
];

const ICON_CARDS = [
  { id: 1, icon: "/img/main/topcarousel/academic-calendar.png", label: "학사일정" },
  { id: 2, icon: "/img/main/topcarousel/freshmen-guide.png", label: "신입생안내" },
  { id: 3, icon: "/img/main/topcarousel/arts-education.png", label: "예술교육원" },
  { id: 4, icon: "/img/main/topcarousel/graduation.png", label: "졸업수료" },
  { id: 5, icon: "/img/main/topcarousel/graduate-program.png", label: "대학원통합과정" },
  { id: 6, icon: "/img/main/topcarousel/industry-collab.png", label: "산학협력단" },
];

export default function MiddleBanners() {
  return (
    <section className="mx-auto max-w-[1280px] px-6 lg:px-8 py-6 md:py-8">
      {/* Mobile: 3-col grid with carousel spanning 2 cols */}
      <div className="lg:hidden">
        <div className="grid grid-cols-4 gap-2 place-items-center">
          {/* Mini carousel - spans 2 columns, 1 row */}
          <div className="col-span-2 row-span-1 w-full flex items-center justify-center">
            <Swiper
              modules={[Pagination]}
              spaceBetween={10}
              slidesPerView={1}
              pagination={{
                clickable: true,
                bulletActiveClass: "mini-bullet-active",
                bulletClass: "mini-bullet",
              }}
              className="mini-carousel-mobile"
            >
              {MINI_CAROUSEL_SLIDES.map((slide) => (
                <SwiperSlide key={slide.id}>
                  <div className="w-full h-full rounded-lg overflow-hidden">
                    <img
                      src={slide.image}
                      alt={slide.alt}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* 6 icons filling remaining cells */}
          {ICON_CARDS.map((card) => (
            <div key={card.id} className="flex flex-col items-center gap-1">
              <button
                className="group flex items-center justify-center w-[72px] h-[72px] bg-bg-light rounded-[10px] hover:brightness-95 transition-all duration-200 cursor-pointer"
              >
                <div className="w-[32px] h-[32px] transition-transform duration-200 group-hover:scale-105">
                  <img src={card.icon} alt={card.label} className="w-full h-full object-contain" />
                </div>
              </button>
              <span className="text-[10px] text-text-sub font-medium whitespace-nowrap">{card.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: horizontal layout */}
      <div className="hidden lg:flex gap-10 items-center justify-center">
        {/* Mini carousel */}
        <div className="w-[260px] shrink-0">
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
                <div className="w-[260px] h-[100px] rounded-[15px] overflow-hidden">
                  <img
                    src={slide.image}
                    alt={slide.alt}
                    className="w-full h-full object-contain"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Divider */}
        <div className="w-px h-[80px] bg-gray-200" />

        {/* Icon cards */}
        <div className="flex-1">
          <div className="grid grid-cols-6 gap-2">
            {ICON_CARDS.map((card) => (
              <div key={card.id} className="flex flex-col items-center gap-2">
                <button
                  className="group flex items-center justify-center w-[100px] h-[100px] bg-bg-light rounded-[15px] hover:brightness-95 transition-all duration-200 cursor-pointer"
                >
                  <div style={{ width: card.desktopSize, height: card.desktopSize }} className="transition-transform duration-200 group-hover:scale-105">
                    <img src={card.icon} alt={card.label} className="w-full h-full object-contain" />
                  </div>
                </button>
                <span className="text-[14px] text-text-sub font-medium whitespace-nowrap">{card.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Mobile: dots inside carousel, smaller */
        .mini-carousel-mobile { position: relative; width: 100%; }
        .mini-carousel-mobile .swiper-wrapper { padding-bottom: 0; }
        .mini-carousel-mobile .swiper-pagination {
          bottom: 4px !important;
          z-index: 10;
        }
        .mini-carousel-mobile .mini-bullet,
        .mini-carousel-mobile .mini-bullet-active {
          width: 4px; height: 4px; margin: 0 2px;
        }
        /* Desktop: dots below carousel */
        .mini-carousel .swiper-wrapper { padding-bottom: 20px; }
        .mini-carousel .swiper-pagination { bottom: 0 !important; }
        .mini-bullet {
          display: inline-block; width: 6px; height: 6px; border-radius: 50%;
          background-color: #c0c0c0; margin: 0 3px; cursor: pointer;
          transition: all 0.2s ease;
        }
        .mini-bullet-active {
          display: inline-block; width: 6px; height: 6px; border-radius: 50%;
          background-color: #505050; margin: 0 3px; cursor: pointer;
          transform: scale(1.2);
        }
      `}</style>
    </section>
  );
}
