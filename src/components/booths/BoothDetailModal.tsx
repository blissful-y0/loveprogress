"use client";

/* eslint-disable @next/next/no-img-element */
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
}

export default function BoothDetailModal({ booth, open, onOpenChange }: BoothDetailModalProps) {
  if (!booth) return null;

  const isAdult = booth.ageType === "adult";
  const allParticipants = [booth.owner, ...booth.participants.slice(0, 3)];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[720px] w-[calc(100vw-2rem)] p-0 overflow-hidden rounded-2xl gap-0 max-h-[90vh] flex flex-col">
        <DialogHeader className="sr-only">
          <DialogTitle>{booth.name}</DialogTitle>
        </DialogHeader>

        {/* Booth Cut Image — 원본 비율 유지 (object-contain) */}
        <div className="w-full aspect-[550/300] bg-[#eee] overflow-hidden shrink-0">
          <img
            src={booth.thumbnailImageKey}
            alt={booth.name}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Info */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto min-w-0">
          {/* Name + Age badge */}
          <div className="flex items-start justify-between gap-3">
            <h2 className="flex-1 min-w-0 text-[20px] font-bold text-[#1a1a1a] leading-tight tracking-[-0.02em] break-all">
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
      </DialogContent>
    </Dialog>
  );
}
