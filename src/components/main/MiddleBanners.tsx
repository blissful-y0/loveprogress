"use client";

/* eslint-disable @next/next/no-img-element */
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import type { MainBannerRow } from "@/types/database";

import "swiper/css";
import "swiper/css/pagination";

// Fallback data when no DB banners exist
const FALLBACK_SLIDES = [
  { id: "f1", image: "/img/main/middle-carousel.jpg", alt: "Phainaxa Wedding Cafe", link: "" },
];

// sort_order 기준 기본 라벨. DB의 이미지/링크를 덮어써도 라벨은 코드 소스로 유지.
const ICON_LABELS: readonly string[] = [
  "학사일정",
  "신입생안내",
  "예술교육원",
  "졸업수료",
  "대학원통합과정",
  "산학협력단",
];

const FALLBACK_ICON_CARDS: { id: number; icon: string; label: string; link: string }[] = [
  { id: 1, icon: "/img/main/topcarousel/academic-calendar.png", label: "학사일정", link: "" },
  { id: 2, icon: "/img/main/topcarousel/freshmen-guide.png", label: "신입생안내", link: "" },
  { id: 3, icon: "/img/main/topcarousel/arts-education.png", label: "예술교육원", link: "" },
  { id: 4, icon: "/img/main/topcarousel/graduation.png", label: "졸업수료", link: "" },
  { id: 5, icon: "/img/main/topcarousel/graduate-program.png", label: "대학원통합과정", link: "" },
  { id: 6, icon: "/img/main/topcarousel/industry-collab.png", label: "산학협력단", link: "" },
];

interface MiddleBannersProps {
  middleBanners?: MainBannerRow[];
  fixedBanners?: MainBannerRow[];
}

export default function MiddleBanners({ middleBanners, fixedBanners }: MiddleBannersProps) {
  const slides = middleBanners && middleBanners.length > 0
    ? middleBanners.map((b) => ({
        id: b.id,
        image: b.image_key,
        alt: `중간 배너 ${b.sort_order + 1}`,
        link: b.link_url ?? "",
      }))
    : FALLBACK_SLIDES;

  // DB 값 우선, 라벨은 sort_order 위치로 매핑. DB가 비어있으면 하드코드 fallback 사용.
  const iconCards = fixedBanners && fixedBanners.length > 0
    ? fixedBanners.map((b, i) => ({
        id: b.id,
        icon: b.image_key,
        label: ICON_LABELS[b.sort_order] ?? ICON_LABELS[i] ?? "",
        link: b.link_url ?? "",
      }))
    : FALLBACK_ICON_CARDS.map((c) => ({ ...c, id: String(c.id) }));
  return (
    <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      {/* Mobile: 3-col grid with carousel spanning 2 cols */}
      <div className="lg:hidden">
        <div className="grid grid-cols-4 gap-2 place-items-center">
          {/* Mini carousel - spans 2 columns, matches icon height */}
          <div className="col-span-2 row-span-1 w-full flex items-center justify-center">
            <Swiper
              modules={[Pagination, Autoplay]}
              spaceBetween={10}
              slidesPerView={1}
              loop={slides.length > 1}
              autoplay={slides.length > 1 ? { delay: 4000, disableOnInteraction: false } : false}
              pagination={{
                clickable: true,
                bulletActiveClass: "mini-bullet-active",
                bulletClass: "mini-bullet",
              }}
              className="mini-carousel-mobile w-full h-[72px]"
            >
              {slides.map((slide) => (
                <SwiperSlide key={slide.id}>
                  <div className="w-full h-[72px] rounded-[10px] overflow-hidden bg-bg-light">
                    {slide.link ? (
                      <a href={slide.link} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                        <img src={slide.image} alt={slide.alt} className="w-full h-full object-cover" />
                      </a>
                    ) : (
                      <img src={slide.image} alt={slide.alt} className="w-full h-full object-cover" />
                    )}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* 6 icons filling remaining cells */}
          {iconCards.map((card) => (
            <div key={card.id} className="flex flex-col items-center gap-1">
              {card.link ? (
                <a
                  href={card.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center w-[72px] h-[72px] bg-bg-light rounded-[10px] hover:brightness-95 transition-all duration-200"
                >
                  <div className="w-[32px] h-[32px] transition-transform duration-200 group-hover:scale-105">
                    <img src={card.icon} alt={card.label} className="w-full h-full object-contain" />
                  </div>
                </a>
              ) : (
                <button
                  className="group flex items-center justify-center w-[72px] h-[72px] bg-bg-light rounded-[10px] hover:brightness-95 transition-all duration-200 cursor-pointer"
                >
                  <div className="w-[32px] h-[32px] transition-transform duration-200 group-hover:scale-105">
                    <img src={card.icon} alt={card.label} className="w-full h-full object-contain" />
                  </div>
                </button>
              )}
              {card.label && <span className="text-[10px] text-text-sub font-medium whitespace-nowrap">{card.label}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: horizontal layout with symmetric inset */}
      <div className="hidden lg:flex items-center justify-center gap-10 px-6">
        {/* Mini carousel */}
        <div className="w-[260px] shrink-0">
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={10}
            slidesPerView={1}
            loop={slides.length > 1}
            autoplay={slides.length > 1 ? { delay: 4000, disableOnInteraction: false } : false}
            pagination={{
              clickable: true,
              bulletActiveClass: "mini-bullet-active",
              bulletClass: "mini-bullet",
            }}
            className="mini-carousel"
          >
            {slides.map((slide) => (
              <SwiperSlide key={slide.id}>
                <div className="w-[260px] h-[100px] rounded-[15px] overflow-hidden">
                  {slide.link ? (
                    <a href={slide.link} target="_blank" rel="noopener noreferrer">
                      <img src={slide.image} alt={slide.alt} className="w-full h-full object-contain" />
                    </a>
                  ) : (
                    <img src={slide.image} alt={slide.alt} className="w-full h-full object-contain" />
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Divider */}
        <div className="w-px h-[80px] bg-gray-200 shrink-0" />

        {/* Icon cards */}
        <div className="shrink-0">
          <div className="grid grid-cols-6 gap-2">
            {iconCards.map((card) => (
              <div key={card.id} className="flex flex-col items-center gap-2">
                {card.link ? (
                  <a
                    href={card.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center w-[100px] h-[100px] bg-bg-light rounded-[15px] hover:brightness-95 transition-all duration-200"
                  >
                    <div className="w-[52px] h-[52px] transition-transform duration-200 group-hover:scale-105">
                      <img src={card.icon} alt={card.label} className="w-full h-full object-contain" />
                    </div>
                  </a>
                ) : (
                  <button
                    className="group flex items-center justify-center w-[100px] h-[100px] bg-bg-light rounded-[15px] hover:brightness-95 transition-all duration-200 cursor-pointer"
                  >
                    <div className="w-[52px] h-[52px] transition-transform duration-200 group-hover:scale-105">
                      <img src={card.icon} alt={card.label} className="w-full h-full object-contain" />
                    </div>
                  </button>
                )}
                {card.label && <span className="text-[14px] text-text-sub font-medium whitespace-nowrap">{card.label}</span>}
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
