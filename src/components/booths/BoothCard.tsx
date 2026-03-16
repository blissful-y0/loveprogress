/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import type { Booth } from "@/lib/mock-booth-data";

interface BoothCardProps {
  readonly booth: Booth;
}

function TwitterIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="shrink-0"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function AgeBadge({ ageType }: { readonly ageType: "general" | "adult" }) {
  const isAdult = ageType === "adult";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-tight ${
        isAdult
          ? "bg-red-50 text-red-600 border border-red-200"
          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
      }`}
    >
      {isAdult ? "성인" : "일반"}
    </span>
  );
}

function KeywordBadge({ keyword }: { readonly keyword: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-text-sub leading-tight">
      #{keyword}
    </span>
  );
}

function ParticipantItem({
  participant,
}: {
  readonly participant: { readonly name: string; readonly snsUrl?: string };
}) {
  return (
    <span className="inline-flex items-center gap-1 text-[13px] text-text-sub">
      {participant.name}
      {participant.snsUrl && (
        <a
          href={participant.snsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-light hover:text-text-dark transition-colors"
          aria-label={`${participant.name} 트위터`}
        >
          <TwitterIcon />
        </a>
      )}
    </span>
  );
}

export default function BoothCard({ booth }: BoothCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const displayImage =
    isHovered && booth.hoverImageKey
      ? booth.hoverImageKey
      : booth.thumbnailImageKey;

  const allParticipants = [booth.owner, ...booth.participants.slice(0, 3)];

  return (
    <article className="group overflow-hidden rounded-[15px] bg-white shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
      {/* Thumbnail */}
      <div
        className="relative aspect-[4/3] overflow-hidden bg-gray-100"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src={displayImage}
          alt={booth.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Booth name + age badge */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] font-bold text-text-dark leading-snug line-clamp-1">
            {booth.name}
          </h3>
          <AgeBadge ageType={booth.ageType} />
        </div>

        {/* Participants */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {allParticipants.map((p, i) => (
            <ParticipantItem key={`${p.name}-${i}`} participant={p} />
          ))}
        </div>

        {/* Keyword badges */}
        <div className="flex flex-wrap gap-1.5">
          {booth.keywords.map((kw) => (
            <KeywordBadge key={kw} keyword={kw} />
          ))}
        </div>
      </div>
    </article>
  );
}
