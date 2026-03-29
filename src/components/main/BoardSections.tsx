/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate, isNewPost } from "@/lib/utils";

interface NoticeItem {
  id: string;
  title: string;
  created_at: string;
}

interface EventItem {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export default async function BoardSections() {
  const supabase = await createClient();

  const { data: notices } = await supabase
    .from("board_posts")
    .select("id, title, created_at")
    .eq("board_type", "notice")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(5)
    .returns<NoticeItem[]>();

  const { data: events } = await supabase
    .from("board_posts")
    .select("id, title, content, created_at")
    .eq("board_type", "event")
    .order("created_at", { ascending: false })
    .limit(1)
    .returns<EventItem[]>();

  const noticeList = notices ?? [];
  const featuredEvent = events?.[0] ?? null;

  return (
    <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14">

        {/* ── Notice ── */}
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="text-[20px] font-bold text-[#1a1a1a] leading-none">공지사항</h2>
            </div>
            <Link
              href="/info/notices"
              className="text-[12px] text-[#aaa] hover:text-primary transition-colors pb-0.5"
            >
              더보기 →
            </Link>
          </div>

          {/* Top border */}
          <div className="h-[1.5px] bg-[#E0E0E0] mb-0" />

          {/* List */}
          <ul className="flex-1">
            {noticeList.length === 0 && (
              <li className="py-8 text-sm text-[#bbb] text-center">
                등록된 공지사항이 없습니다.
              </li>
            )}
            {noticeList.map((notice, i) => (
              <li key={notice.id}>
                <Link
                  href={`/info/notices/${notice.id}`}
                  className={`flex items-center gap-3 py-3 group ${
                    i < noticeList.length - 1 ? "border-b border-[#f0f0f0]" : ""
                  }`}
                >
                  <span className="w-[5px] h-[5px] rounded-full bg-[#ccc] shrink-0" />
                  <span className="flex-1 text-[14px] text-[#333] truncate group-hover:text-primary transition-colors">
                    {notice.title}
                  </span>
                  {isNewPost(notice.created_at) && (
                    <span className="shrink-0 px-1.5 py-px rounded-[3px] text-[10px] font-bold text-white bg-primary leading-none">
                      N
                    </span>
                  )}
                  <span className="shrink-0 text-[12px] text-[#bbb] tabular-nums">
                    {formatDate(notice.created_at)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Bottom border */}
          <div className="h-[1.5px] bg-[#E0E0E0] mt-auto" />
        </div>

        {/* ── Academic Info ── */}
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="text-[20px] font-bold text-[#1a1a1a] leading-none">학사 안내</h2>
            </div>
            <Link
              href="/info/events"
              className="text-[12px] text-[#aaa] hover:text-primary transition-colors pb-0.5"
            >
              더보기 →
            </Link>
          </div>

          {/* Top border */}
          <div className="h-[1.5px] bg-[#E0E0E0]" />

          {/* Featured event */}
          <div className="flex-1 pt-4">
            {featuredEvent ? (
              <Link
                href={`/info/events/${featuredEvent.id}`}
                className="flex gap-4 group"
              >
                {/* Thumbnail */}
                <div className="w-[120px] md:w-[140px] h-[140px] md:h-[160px] rounded-[12px] overflow-hidden shrink-0 bg-[#f0f4f0]">
                  <img
                    src="/img/main/board/event.jpg"
                    alt={featuredEvent.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col justify-between flex-1 min-w-0 py-1">
                  <div className="space-y-2">
                    <h3 className="text-[14px] font-semibold text-[#1a1a1a] line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                      {featuredEvent.title}
                    </h3>
                    <p className="text-[12px] text-[#bbb]">
                      {formatDate(featuredEvent.created_at)}
                    </p>
                    <p className="text-[13px] text-[#777] leading-relaxed line-clamp-3 break-all">
                      &nbsp;
                    </p>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="flex items-center justify-center py-10 text-sm text-[#bbb]">
                등록된 학사 안내가 없습니다.
              </div>
            )}
          </div>

          {/* Bottom border */}
          <div className="h-[1.5px] bg-[#E0E0E0] mt-4" />
        </div>

      </div>
    </section>
  );
}
