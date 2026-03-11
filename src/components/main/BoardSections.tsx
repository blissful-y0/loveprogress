"use client";

import Image from "next/image";
import Link from "next/link";

// TODO: Replace with API data - fetch notices from /api/notices
const MOCK_NOTICES = [
  {
    id: 1,
    title: "2026학년도 봄 정기공연 참가 신청 안내",
    date: "2026.03.10",
    isNew: true,
  },
  {
    id: 2,
    title: "나무정원 갤러리 3월 전시 일정 공지",
    date: "2026.03.08",
    isNew: true,
  },
  {
    id: 3,
    title: "파이낙사 온리전 사전등록 마감 안내",
    date: "2026.03.05",
    isNew: true,
  },
  {
    id: 4,
    title: "제5회 사랑의 진도 행사 자원봉사자 모집",
    date: "2026.02.28",
    isNew: false,
  },
  {
    id: 5,
    title: "2026년 상반기 예술교육원 수강생 모집",
    date: "2026.02.25",
    isNew: false,
  },
];

// TODO: Replace with API data - fetch featured post from /api/events
const MOCK_FEATURED_POST = {
  id: 1,
  title: "파이낙사 웨딩카페 그랜드 오픈 이벤트",
  content:
    "깨달음의 나무 정원에서 새롭게 오픈하는 파이낙사 웨딩카페의 그랜드 오픈을 기념하여 특별 이벤트를 진행합니다. 방문해 주시는 모든 분들께 기념품을 증정하며, 현장에서 다양한 체험 프로그램도 함께 즐기실 수 있습니다. 많은 관심과 참여 부탁드립니다.",
  image: "/img/main/board/event.jpg",
};

export default function BoardSections() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Notice section */}
        <div>
          <div className="flex items-baseline justify-between mb-1">
            <h2 className="text-xl md:text-2xl font-bold text-text-dark">
              Notice
            </h2>
            <Link
              href="/info/notices"
              className="text-sm text-text-light hover:text-text-sub transition-colors"
            >
              more &gt;
            </Link>
          </div>
          <p className="text-sm text-text-muted mb-4">
            나무정원에서 전하는 주요 공지를 확인하세요.
          </p>

          <ul className="space-y-3">
            {MOCK_NOTICES.map((notice) => (
              <li key={notice.id}>
                <Link
                  href={`/info/notices/${notice.id}`}
                  className="flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-text-muted shrink-0" />
                  <span className="flex-1 text-sm text-text-dark truncate group-hover:text-primary transition-colors">
                    {notice.title}
                  </span>
                  {notice.isNew && (
                    <span className="shrink-0 rounded-full bg-red-400 px-2 py-0.5 text-[10px] font-semibold text-white leading-none">
                      New
                    </span>
                  )}
                  <span className="shrink-0 text-xs text-text-light">
                    {notice.date}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Academic Info section */}
        <div>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-text-dark">
              Academic Info
            </h2>
            <Link
              href="/info/events"
              className="text-sm text-text-light hover:text-text-sub transition-colors"
            >
              more &gt;
            </Link>
          </div>

          <div className="flex gap-4">
            {/* Featured post image */}
            <div className="relative w-[160px] md:w-[200px] h-[190px] md:h-[230px] rounded-lg overflow-hidden shrink-0">
              <Image
                src={MOCK_FEATURED_POST.image}
                alt={MOCK_FEATURED_POST.title}
                fill
                className="object-cover"
                sizes="200px"
              />
            </div>

            {/* Featured post content */}
            <div className="flex flex-col justify-between flex-1 min-w-0">
              <div>
                <h3 className="text-base md:text-lg font-semibold text-text-dark mb-2 line-clamp-2">
                  {MOCK_FEATURED_POST.title}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed line-clamp-5">
                  {MOCK_FEATURED_POST.content.slice(0, 150)}
                  {MOCK_FEATURED_POST.content.length > 150 ? "..." : ""}
                </p>
              </div>

              <div className="mt-3">
                <Link
                  href="https://x.com/phainaxa_event"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="relative w-[30px] h-[30px] rounded-full overflow-hidden">
                    <Image
                      src="/img/main/board/twitter.png"
                      alt="Twitter"
                      fill
                      className="object-cover"
                      sizes="30px"
                    />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
