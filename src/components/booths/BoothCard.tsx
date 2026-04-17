/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { HeartIcon } from "lucide-react";
import type { BoothCardData } from "@/types/booth";
import {
  BOOTH_AGE_COLORS,
  getBoothKeywordColor,
} from "@/lib/booth-keyword-colors";

interface BoothCardProps {
  readonly booth: BoothCardData;
  readonly onClick: () => void;
  readonly likeCount?: number;
  readonly liked?: boolean;
  readonly isLoggedIn?: boolean;
  readonly onToggleLike?: (boothId: string) => void;
}

// 카드 썸네일 정보바에서 보여주는 키워드 축약 라벨
const KEYWORD_SHORT: Record<string, string> = {
  "그림회지": "그림",
  "글회지": "글",
  "팬시굿즈": "팬시",
  "수공예품": "수공예",
  "무료나눔": "무료나눔",
};

export default function BoothCard({
  booth,
  onClick,
  likeCount = 0,
  liked = false,
  isLoggedIn = false,
  onToggleLike,
}: BoothCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isAdult = booth.ageType === "adult";
  const ageColor = isAdult ? BOOTH_AGE_COLORS.adult : BOOTH_AGE_COLORS.general;
  const ageLabel = isAdult ? "성인" : "일반";

  const allParticipants = [booth.owner, ...booth.participants.slice(0, 3)];
  const displayImage =
    isHovered && booth.hoverImageKey ? booth.hoverImageKey : booth.thumbnailImageKey;

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      alert("로그인 후 이용 가능합니다.");
      return;
    }
    onToggleLike?.(booth.id);
  };

  return (
    <div
      className="group w-full cursor-pointer flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Thumbnail — aspect 314:220 ≈ 1.43 */}
      <div
        className={`relative aspect-[314/220] overflow-hidden rounded-[6px] bg-[#f4f4f4] ring-1 transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-0.5 ${
          liked ? "ring-[#34aa8f]" : "ring-[#e0e0e0] group-hover:ring-[#bdbdbd]"
        }`}
      >
        {/* Preload hover image */}
        {booth.hoverImageKey && (
          <img
            src={booth.hoverImageKey}
            alt=""
            className="absolute w-0 h-0 opacity-0 pointer-events-none"
            aria-hidden="true"
          />
        )}
        <img
          src={displayImage}
          alt={booth.name}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          loading="lazy"
        />

        {/* Top-right heart */}
        <button
          type="button"
          onClick={handleLike}
          className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded-full bg-white/85 backdrop-blur-sm hover:bg-white transition-colors cursor-pointer shadow-sm group/like"
          aria-label={liked ? "좋아요 취소" : "좋아요"}
        >
          <HeartIcon
            className={`size-[14px] transition-colors ${
              liked
                ? "fill-[#34aa8f] text-[#34aa8f]"
                : "text-[#9a9a9a] group-hover/like:text-[#34aa8f]"
            }`}
          />
          {likeCount > 0 && (
            <span
              className={`text-[11px] font-semibold tabular-nums ${
                liked ? "text-[#34aa8f]" : "text-[#707070]"
              }`}
            >
              {likeCount}
            </span>
          )}
        </button>

        {/* Bottom info strip: age badge + keyword dots */}
        <div className="absolute inset-x-0 bottom-0 bg-white/90 backdrop-blur-sm px-2 py-1.5 flex items-center gap-1.5">
          <span
            className="shrink-0 px-1.5 py-[1px] rounded-[3px] text-[10px] font-bold text-white leading-tight tracking-wide"
            style={{ backgroundColor: ageColor }}
          >
            {ageLabel}
          </span>
          <span className="flex-1 min-w-0 truncate text-[10.5px] font-medium">
            {booth.keywords.map((kw, i) => (
              <span key={kw}>
                {i > 0 && <span className="text-[#c8c8c8] mx-[3px]">·</span>}
                <span style={{ color: getBoothKeywordColor(kw) }}>
                  {KEYWORD_SHORT[kw] ?? kw}
                </span>
              </span>
            ))}
          </span>
        </div>
      </div>

      {/* Text area */}
      <div className="mt-3 px-0.5">
        <h3 className="text-[14px] font-bold text-[#1a1a1a] leading-snug tracking-[-0.02em] line-clamp-2 min-h-[2.6em]">
          {booth.name}
        </h3>

        <p className="mt-1.5 text-[12px] font-medium text-[#707070] tracking-[-0.01em] line-clamp-2 leading-relaxed">
          {allParticipants.map((p, i) => (
            <span key={`${p.name}-${i}`}>
              {i > 0 && <span className="text-[#d0d0d0] mx-[4px]">&middot;</span>}
              {p.snsUrl ? (
                <a
                  href={p.snsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="underline underline-offset-2 decoration-[#ccc] hover:decoration-[#666] hover:text-[#333] transition-colors"
                >
                  {p.name}
                </a>
              ) : (
                p.name
              )}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
