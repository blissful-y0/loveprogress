"use client";

/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { HeartIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { BoothCardData } from "@/types/booth";
import { BOOTH_KEYWORD_COLORS } from "@/lib/booth-keyword-colors";

interface BoothDetailModalProps {
  booth: BoothCardData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 부스홍보게시판: 제목 앞 [행-열] */
  positionLabel?: string;
  /** 지정하면 이미지 오른쪽 아래에 하트(즐겨찾기) 표시 */
  like?: { liked: boolean; isLoggedIn: boolean; onToggle: (boothId: string) => void };
  /** 카드 아래 버튼 영역 */
  actions?: ReactNode;
  /** compact: 부스홍보게시판용 좁은 카드 */
  size?: "default" | "compact";
}

export default function BoothDetailModal({
  booth,
  open,
  onOpenChange,
  positionLabel,
  like,
  actions,
  size = "default",
}: BoothDetailModalProps) {
  if (!booth) return null;
  const compact = size === "compact";

  const handleLike = () => {
    if (!like) return;
    if (!like.isLoggedIn) {
      alert("로그인 후 이용 가능합니다.");
      return;
    }
    like.onToggle(booth.id);
  };

  const isAdult = booth.ageType === "adult";
  const allParticipants = [booth.owner, ...booth.participants.slice(0, 3)];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${compact ? "max-w-[360px] sm:max-w-[360px]" : "max-w-[720px]"} w-[calc(100vw-2rem)] p-0 gap-4 bg-transparent ring-0 max-h-[90vh] flex flex-col`}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{booth.name}</DialogTitle>
        </DialogHeader>

        <div className="bg-background rounded-2xl ring-1 ring-foreground/10 overflow-hidden flex flex-col min-h-0">
          {/* Booth Cut Image — 원본 비율 그대로 노출 */}
          <div className="relative w-full bg-[#eee] shrink-0 flex items-center justify-center">
            <img
              src={booth.thumbnailImageKey}
              alt={booth.name}
              className={`w-full h-auto object-contain ${compact ? "max-h-[40vh]" : "max-h-[60vh]"}`}
            />
            {like && (
              <button
                type="button"
                onClick={handleLike}
                className="absolute bottom-2.5 right-2.5 flex items-center justify-center w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-sm cursor-pointer transition-colors"
                aria-label={like.liked ? "즐겨찾기 취소" : "즐겨찾기"}
              >
                <HeartIcon
                  className={`size-4 ${like.liked ? "fill-[#33aa8e] text-[#33aa8e]" : "text-[#9a9a9a]"}`}
                />
              </button>
            )}
          </div>

          {/* Info */}
          <div className="px-6 py-5 space-y-4 overflow-y-auto min-w-0">
            {/* Name + Age badge */}
            <div className="flex items-start justify-between gap-3">
              <h2 className="flex-1 min-w-0 text-[20px] font-bold text-[#1a1a1a] leading-tight tracking-[-0.02em] break-all">
                {positionLabel && <span>[{positionLabel}] </span>}
                {booth.name}
              </h2>
              <span
                className={`shrink-0 rounded-full px-3 py-[3px] text-[11px] font-semibold tracking-wide ${
                  isAdult
                    ? "text-[#dc4a4a] bg-[#fef2f2] ring-1 ring-inset ring-[#fecaca]"
                    : "text-[#0d9373] bg-[#ecfdf5] ring-1 ring-inset ring-[#a7f3d0]"
                }`}
              >
                {isAdult ? "성인" : "일반"}
              </span>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#f0f0f0]" />

            {/* Participants */}
            <div>
              <p className="text-[11px] font-semibold text-[#bbb] tracking-[0.05em] uppercase mb-2">참가자</p>
              <div className="flex flex-wrap gap-x-5 gap-y-1">
                {allParticipants.map((p, i) => (
                  <span
                    key={`${p.name}-${i}`}
                    className="text-[14px] font-medium text-[#505050] break-all max-w-full"
                  >
                    {p.snsUrl ? (
                      <a
                        href={p.snsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2 decoration-[#ccc] hover:decoration-[#666] hover:text-[#333] transition-colors duration-200"
                      >
                        {p.name}
                      </a>
                    ) : (
                      p.name
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Keywords */}
            <div className="flex flex-wrap gap-[6px]">
              {booth.keywords.map((kw) => (
                <span
                  key={kw}
                  className={`rounded-full px-3 py-[3px] text-[11px] font-semibold ring-1 ring-inset ${BOOTH_KEYWORD_COLORS[kw] ?? "text-[#999] ring-[#e5e5e5]"}`}
                >
                  #{kw}
                </span>
              ))}
            </div>
          </div>
        </div>

        {actions && <div className="flex justify-center gap-4 shrink-0">{actions}</div>}
      </DialogContent>
    </Dialog>
  );
}
