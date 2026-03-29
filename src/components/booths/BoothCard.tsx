/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import type { BoothCardData } from "@/types/booth";
import { BOOTH_KEYWORD_COLORS } from "@/lib/booth-keyword-colors";

interface BoothCardProps {
  readonly booth: BoothCardData;
  readonly onClick: () => void;
}

export default function BoothCard({ booth, onClick }: BoothCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isAdult = booth.ageType === "adult";
  const allParticipants = [booth.owner, ...booth.participants.slice(0, 3)];

  const displayImage =
    isHovered && booth.hoverImageKey ? booth.hoverImageKey : booth.thumbnailImageKey;

  return (
    <div
      className="group w-full cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Booth cut — 550x300 */}
      <div className="relative aspect-[550/300] overflow-hidden rounded-md bg-[#eee]">
        <img
          src={displayImage}
          alt={booth.name}
          className="w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-[1.03] group-hover:brightness-[0.97]"
          loading="lazy"
        />

        {/* Hover overlay — subtle gradient at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
