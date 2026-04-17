"use client";

import { useState } from "react";
import type { QnaPost, SecretQnaPayload } from "../_lib/types";
import { getCharacterByKey } from "../_lib/constants";

interface QnaCardProps {
  item: QnaPost;
  index: number;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

function formatReceptionId(index: number): string {
  return `3355-0338-${String(index).padStart(3, "0")}`;
}

/** 레이블 | 값 한 줄 */
function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline gap-2.5">
      <span className="text-[11px] font-bold text-[#909090] tracking-wide w-[44px] text-right shrink-0">
        {label}
      </span>
      <span className="text-[12px] text-[#d0d0d0] shrink-0">|</span>
      <span className={`overflow-hidden truncate ${mono
        ? "text-[14px] text-[#505050] font-mono tracking-wide"
        : "text-[15px] text-[#505050] font-medium"
      }`}>
        {value}
      </span>
    </div>
  );
}

export function QnaCard({ item, index }: QnaCardProps) {
  const [passwordInput, setPasswordInput] = useState("");
  const [secretPayload, setSecretPayload] = useState<SecretQnaPayload | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  const character = getCharacterByKey(item.image_key);

  const handleVerify = async () => {
    if (!passwordInput.trim()) { setVerifyError("비밀번호를 입력해주세요"); return; }
    setIsVerifying(true);
    try {
      const res = await fetch(`/api/qna/${item.id}/verify-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = (await res.json()) as SecretQnaPayload | { error?: string };
      if (!res.ok) {
        setVerifyError("error" in data && data.error ? data.error : "비밀번호를 다시 확인해주세요");
        return;
      }
      setSecretPayload(data as SecretQnaPayload);
      setPasswordInput("");
      setVerifyError("");
    } catch {
      setVerifyError("잠시 후 다시 시도해주세요");
    } finally {
      setIsVerifying(false);
    }
  };

  const isOwnerOrPublic = !item.is_secret || item.isOwner;
  const contentVisible = isOwnerOrPublic || secretPayload !== null;
  const displayContent = contentVisible ? (item.content || secretPayload?.content || "") : "";
  const displayAnswer = contentVisible ? (item.answer ?? secretPayload?.answer ?? null) : null;

  return (
    <div className="rounded-[18px] overflow-hidden border border-[#e0f0ea] shadow-sm">
      {/* ── Top bar ── */}
      <div className="bg-primary px-5 py-2.5 flex items-center justify-between">
        <span className="text-[12px] font-semibold text-white/80">No. {index}</span>
        <div className="flex items-center gap-2">
          {item.hasAnswer && (
            <span className="text-[11px] font-bold text-white bg-white/20 px-2.5 py-0.5 rounded-full">
              답변완료
            </span>
          )}
          {item.is_secret && (
            <span className="text-[11px] font-bold text-white bg-black/15 px-2.5 py-0.5 rounded-full">
              비밀글
            </span>
          )}
        </div>
      </div>

      {/* ── ID card body ── */}
      <div className="bg-white px-5 py-4 flex gap-5 items-start">
        {/* Photo */}
        <div className="shrink-0">
          <div className="w-[100px] h-[120px] rounded-[10px] overflow-hidden bg-[#fafafa]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={character.src} alt={character.label} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Info rows */}
        <div className="flex-1 min-w-0 flex flex-col gap-2 pt-1">
          <InfoRow label="성명" value={item.writer_name} />
          <InfoRow label="소속" value={character.label} />
          <InfoRow label="학번" value={formatReceptionId(index)} mono />
          <InfoRow label="접수일" value={formatDate(item.created_at)} mono />
        </div>

        {/* Stamp */}
        <div className="shrink-0 flex items-center justify-center pt-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.hasAnswer ? "/img/qna/stamp-answered.png" : "/img/qna/stamp-no-answer.png"}
            alt={item.hasAnswer ? "답변완료 도장" : "나무정원 도장"}
            className="w-[72px] h-[72px] object-contain"
          />
        </div>
      </div>

      {/* ── Content band (문의) ── */}
      <div className="bg-[#f5fbf8] border-t-[1.5px] border-[#dff0e9] px-5 py-3 flex items-start gap-2.5">
        <span className="text-[11px] font-bold text-primary tracking-wide w-7 text-right shrink-0 mt-0.5">문의</span>
        <div className="w-[1.5px] self-stretch bg-[#cce9e0] rounded shrink-0 mx-0.5" />
        {item.is_secret && !contentVisible ? (
          <span className="text-[14px] text-[#bbb] italic">비밀번호를 입력하면 내용을 볼 수 있습니다</span>
        ) : (
          <p className="text-[14px] text-[#505050] leading-relaxed whitespace-pre-wrap">{displayContent}</p>
        )}
      </div>

      {/* ── Secret password input (비로그인 작성 글만) ── */}
      {item.is_secret && !contentVisible && (
        <div className="bg-white border-t border-[#f0f0f0] px-5 py-3 flex flex-wrap items-center gap-2">
          <input
            type="password"
            placeholder="비밀번호 입력"
            value={passwordInput}
            onChange={(e) => { setPasswordInput(e.target.value); setVerifyError(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") handleVerify(); }}
            onClick={(e) => e.stopPropagation()}
            className="h-[30px] border border-[#e0e0e0] rounded-[8px] px-3 text-[13px] w-32 focus:outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleVerify(); }}
            disabled={isVerifying}
            className="h-[30px] bg-primary text-white rounded-[8px] px-4 text-[13px] font-semibold hover:bg-primary/90 disabled:opacity-50"
          >
            {isVerifying ? "확인 중..." : "확인"}
          </button>
          {verifyError && <span className="text-[13px] text-red-500">{verifyError}</span>}
        </div>
      )}

      {/* ── Answer (항상 표시) ── */}
      {contentVisible && (
        <div className="bg-white border-t-[1.5px] border-dashed border-[#dff0e9] px-5 py-4">
          <p className="text-[12px] font-bold text-[#888] mb-2">A. 답변</p>
          {displayAnswer ? (
            <div className="bg-[#f8f8f8] rounded-[10px] px-4 py-3.5 text-[14px] text-[#505050] leading-relaxed whitespace-pre-wrap">
              {displayAnswer}
            </div>
          ) : (
            <div className="bg-[#f8f8f8] rounded-[10px] px-4 py-3.5 text-[14px] text-[#bbb] italic">
              아직 답변이 등록되지 않았습니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
