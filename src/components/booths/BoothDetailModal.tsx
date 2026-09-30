"use client";

/* eslint-disable @next/next/no-img-element */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { BoothCardData } from "@/types/booth";
import { HeartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOTH_KEYWORD_COLORS } from "@/lib/booth-keyword-colors";

interface BoothDetailModalProps {
  booth: BoothCardData | null;
  promotion?: boolean;
  liked?: boolean;
  likePending?: boolean;
  onToggleLike?: () => void;
  onEdit?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BoothDetailModal({ booth, open, onOpenChange, promotion = false, liked = false, likePending = false, onToggleLike, onEdit }: BoothDetailModalProps) {
  if (!booth) return null;

  const isAdult = booth.ageType === "adult";
  const allParticipants = [booth.owner, ...booth.participants.slice(0, 3)];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[720px] w-[calc(100vw-2rem)] p-0 overflow-hidden rounded-2xl gap-0 max-h-[90vh] flex flex-col">
        <DialogHeader className="sr-only">
          <DialogTitle>{booth.name}</DialogTitle>
        </DialogHeader>

        {/* Booth Cut Image — 원본 비율 그대로 노출 */}
        <div className="relative w-full bg-[#eee] shrink-0 flex items-center justify-center">
          <img
            src={booth.thumbnailImageKey}
            alt={booth.name}
            className="w-full h-auto max-h-[60vh] object-contain"
          />
          {promotion && <button type="button" aria-label={liked ? "즐겨찾기 해제" : "즐겨찾기"} aria-pressed={liked} disabled={likePending} onClick={onToggleLike} className="absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-full bg-white text-[#33aa8e] shadow disabled:opacity-50"><HeartIcon className="size-5" fill={liked ? "currentColor" : "none"} /></button>}
        </div>

        {/* Info */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto min-w-0">
          {/* Name + Age badge */}
          <div className="flex items-start justify-between gap-3">
            <h2 className="flex-1 min-w-0 text-[20px] font-bold text-[#1a1a1a] leading-tight tracking-[-0.02em] break-all">
              {promotion && booth.rowLabel && `[${booth.rowLabel}-${booth.columnNumber}] `}{booth.name}
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
        {promotion && <div className="flex justify-center gap-8 px-6 pb-5">
          {booth.infoUrl && /^https?:\/\//i.test(booth.infoUrl) ? <a href={booth.infoUrl} target="_blank" rel="noopener noreferrer" className="flex h-[30px] w-20 items-center justify-center rounded bg-[#33aa8e] text-base font-semibold text-white">부스인포</a> : <Button disabled className="h-[30px] w-20 bg-[#999] text-base font-semibold text-white opacity-100 disabled:opacity-100">부스인포</Button>}
          {onEdit && <Button variant="outline" onClick={onEdit} className="h-[30px] w-20 text-base font-semibold">수정</Button>}
        </div>}
      </DialogContent>
    </Dialog>
  );
}
