"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

// TODO: Replace with API data - fetch notices from /api/notices
const MOCK_NOTICES = [
  { id: 1, title: "부스 운영 안내", date: "2026-05-21", isNew: true },
  { id: 2, title: "1차 부스신청 안내", date: "2026-05-10", isNew: true },
  { id: 3, title: "행사 협력 및 시즌그리팅 멤버 안내", date: "2026-05-10", isNew: true },
  { id: 4, title: "행사 로드맵", date: "2026-04-21", isNew: false },
  { id: 5, title: "홈페이지 오픈 안내", date: "2026-04-20", isNew: false },
];

// TODO: Replace with API data - fetch featured post from /api/events
const MOCK_FEATURED_POST = {
  id: 1,
  title: "[필마켓] 포지요, 포지요",
  content:
    "파이낙사 온리전 · 사랑의 진도 2. 수식 장르의 통합 행사! 파이낙사 배틀공학과의 온리이벤트에 오신 것을 환영합니다. F.1 팬미리에 무대 주세요. 수강 등록. 행운.",
  image: "/img/main/board/event.jpg",
};

function formatDate(dateStr: string): string {
  return dateStr.replace(/-/g, ".");
}

export default function BoardSections() {
  return (
    <section className="mx-auto max-w-[1280px] px-6 lg:px-8 py-6 md:py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-16">
        {/* Notice section */}
        <div className="flex flex-col">
          <div className="flex items-end justify-between pb-5">
            <div className="flex items-baseline gap-3">
              <h2 className="text-[24px] font-bold text-text-dark shrink-0">
                Notice
              </h2>
              <p className="text-[14px] font-bold text-text-sub hidden md:block">
                나무정원에서 전하는 주요 공지를 확인하세요.
              </p>
            </div>
            <Link
              href="/info/notices"
              className="text-[14px] font-bold text-text-sub hover:text-text-dark transition-colors shrink-0"
            >
              more &gt;
            </Link>
          </div>

          <div className="border-t-2 border-border-light flex-1 flex flex-col">
            <ul className="flex-1">
              {MOCK_NOTICES.map((notice, i) => (
                <li key={notice.id}>
                  <Link
                    href={`/info/notices/${notice.id}`}
                    className={`flex items-center gap-3 py-3 group ${
                      i < MOCK_NOTICES.length - 1 ? "border-b border-border-light" : ""
                    }`}
                  >
                    <span className="w-1 h-1 rounded-full bg-text-muted shrink-0" />
                    <span className="flex-1 text-[16px] font-semibold text-text-sub truncate group-hover:text-primary transition-colors">
                      {notice.title}
                    </span>
                    {notice.isNew && (
                      <span className="shrink-0 w-[28px] h-[15px] flex items-center justify-center rounded-[2px] text-[12px] font-light text-white bg-primary leading-none">
                        N
                      </span>
                    )}
                    <span className="shrink-0 text-[16px] font-light text-[#a5a5a5] tabular-nums">
                      {formatDate(notice.date)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="border-b-2 border-border-light mt-auto" />
          </div>
        </div>

        {/* Academic Info section */}
        <div className="flex flex-col">
          <div className="flex items-end justify-between pb-5">
            <h2 className="text-[24px] font-bold text-text-dark">
              Academic Info
            </h2>
            <Link
              href="/info/events"
              className="text-[14px] font-bold text-text-sub hover:text-text-dark transition-colors"
            >
              more &gt;
            </Link>
          </div>

          <div className="border-t-2 border-border-light pt-2 flex-1 flex flex-col">
            <div className="flex gap-5">
              {/* Featured post image */}
              <div className="w-[160px] md:w-[200px] h-[190px] md:h-[230px] rounded-[15px] overflow-hidden shrink-0">
                <img
                  src={MOCK_FEATURED_POST.image}
                  alt={MOCK_FEATURED_POST.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Featured post content */}
              <div className="flex flex-col justify-between flex-1 min-w-0 py-1">
                <div>
                  <h3 className="text-[16px] font-semibold text-text-sub mb-3 line-clamp-2">
                    {MOCK_FEATURED_POST.title}
                  </h3>
                  <p className="text-[14px] font-light text-text-light leading-[1.8] line-clamp-5">
                    {MOCK_FEATURED_POST.content.slice(0, 150)}
                    {MOCK_FEATURED_POST.content.length > 150 ? "..." : ""}
                  </p>
                </div>

                <div className="mt-4">
                  <Link
                    href="https://x.com/phainaxa_event"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block opacity-60 hover:opacity-100 transition-opacity"
                  >
                    <div className="w-[30px] h-[30px] rounded-full bg-bg-light overflow-hidden flex items-center justify-center">
                      <img
                        src="/img/main/board/twitter.png"
                        alt="Twitter"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="border-b-2 border-border-light mt-auto" />
        </div>
      </div>
    </section>
  );
}
