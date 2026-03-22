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
              {noticeList.length === 0 && (
                <li className="py-3 text-sm text-text-muted text-center">
                  등록된 공지사항이 없습니다.
                </li>
              )}
              {noticeList.map((notice, i) => (
                <li key={notice.id}>
                  <Link
                    href={`/info/notices/${notice.id}`}
                    className={`flex items-center gap-3 py-3 group ${
                      i < noticeList.length - 1
                        ? "border-b border-border-light"
                        : ""
                    }`}
                  >
                    <span className="w-1 h-1 rounded-full bg-text-muted shrink-0" />
                    <span className="flex-1 text-[16px] font-semibold text-text-sub truncate group-hover:text-primary transition-colors">
                      {notice.title}
                    </span>
                    {isNewPost(notice.created_at) && (
                      <span className="shrink-0 w-[28px] h-[15px] flex items-center justify-center rounded-[2px] text-[12px] font-light text-white bg-primary leading-none">
                        N
                      </span>
                    )}
                    <span className="shrink-0 text-[16px] font-light text-[#a5a5a5] tabular-nums">
                      {formatDate(notice.created_at)}
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
            {featuredEvent ? (
              <div className="flex gap-5">
                {/* Featured post image */}
                <div className="w-[160px] md:w-[200px] h-[190px] md:h-[230px] rounded-[15px] overflow-hidden shrink-0">
                  <img
                    src="/img/main/board/event.jpg"
                    alt={featuredEvent.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Featured post content */}
                <div className="flex flex-col justify-between flex-1 min-w-0 py-1">
                  <div>
                    <h3 className="text-[16px] font-semibold text-text-sub mb-3 line-clamp-2">
                      {featuredEvent.title}
                    </h3>
                    <p className="text-[14px] font-light text-text-light leading-[1.8] line-clamp-5">
                      {featuredEvent.content.slice(0, 150)}
                      {featuredEvent.content.length > 150 ? "..." : ""}
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
            ) : (
              <div className="flex items-center justify-center py-10 text-sm text-text-muted">
                등록된 행사 안내가 없습니다.
              </div>
            )}
          </div>
          <div className="border-b-2 border-border-light mt-auto" />
        </div>
      </div>
    </section>
  );
}
