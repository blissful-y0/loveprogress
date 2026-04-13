/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { HeartIcon } from "lucide-react";
import type { BoothCardData } from "@/types/booth";
import { BOOTH_KEYWORD_COLORS } from "@/lib/booth-keyword-colors";

interface BoothCardProps {
  readonly booth: BoothCardData;
  readonly onClick: () => void;
  readonly likeCount?: number;
  readonly liked?: boolean;
  readonly isLoggedIn?: boolean;
  readonly onToggleLike?: (boothId: string) => void;
}

export default function BoothCard({ booth, onClick, likeCount = 0, liked = false, isLoggedIn = false, onToggleLike }: BoothCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isAdult = booth.ageType === "adult";
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
      className="group w-full cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Booth cut — 550x300 */}
      <div className="relative aspect-[550/300] overflow-hidden rounded-md bg-[#eee]">
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
          className="w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-[1.03] group-hover:brightness-[0.97]"
          loading="lazy"
        />

        {/* Hover overlay — subtle gradient at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Like button */}
        <button
          type="button"
          onClick={handleLike}
          className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors cursor-pointer"
        >
          <HeartIcon
            className={`size-4 transition-colors ${liked ? "fill-[#e74c3c] text-[#e74c3c]" : "text-[#999]"}`}
          />
          {likeCount > 0 && (
            <span className={`text-[11px] font-medium ${liked ? "text-[#e74c3c]" : "text-[#999]"}`}>
              {likeCount}
            </span>
          )}
        </button>
      </div>

      {/* Text area */}
      <div className="mt-4 text-center">
        {/* Booth name */}
        <h3 className="text-[17px] font-bold text-[#1a1a1a] leading-tight tracking-[-0.02em] line-clamp-1">
          {booth.name}
        </h3>

        {/* Participants — linked names get underline */}
        <p className="mt-1.5 text-[13px] font-medium text-[#707070] tracking-[-0.01em]">
          {allParticipants.map((p, i) => (
            <span key={`${p.name}-${i}`}>
              {i > 0 && <span className="text-[#d0d0d0] mx-[5px]">&middot;</span>}
              {p.snsUrl ? (
                <a
                  href={p.snsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="underline underline-offset-2 decoration-[#ccc] hover:decoration-[#666] hover:text-[#333] transition-colors duration-200"
                >
                  {p.name}
                </a>
              ) : (
                p.name
              )}
            </span>
          ))}
        </p>

        {/* Tags row */}
        <div className="flex flex-wrap justify-center gap-[6px] mt-2.5">
          <span
            className={`rounded-full px-[10px] py-[3px] text-[10.5px] font-semibold tracking-wide ${
              isAdult
                ? "text-[#dc4a4a] bg-[#fef2f2] ring-1 ring-inset ring-[#fecaca]"
                : "text-[#0d9373] bg-[#ecfdf5] ring-1 ring-inset ring-[#a7f3d0]"
            }`}
          >
            #{isAdult ? "성인" : "일반"}
          </span>
          {booth.keywords.map((kw) => (
            <span
              key={kw}
              className={`rounded-full px-[10px] py-[3px] text-[10.5px] font-semibold ring-1 ring-inset ${BOOTH_KEYWORD_COLORS[kw] ?? "text-[#999] ring-[#e5e5e5]"}`}
            >
              #{kw}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
