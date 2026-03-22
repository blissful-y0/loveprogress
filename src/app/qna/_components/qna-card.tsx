"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock, CheckCircle2 } from "lucide-react";
import type { QnaPost, SecretQnaPayload } from "../_lib/types";
import { getCharacterByKey } from "../_lib/constants";

interface QnaCardProps {
  item: QnaPost;
  index: number;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

export function QnaCard({ item, index }: QnaCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [secretPayload, setSecretPayload] = useState<SecretQnaPayload | null>(
    null,
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  const character = getCharacterByKey(item.image_key);

  const handleVerify = async () => {
    if (!passwordInput.trim()) {
      setVerifyError("비밀번호를 입력해주세요");
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch(`/api/qna/${item.id}/verify-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });

      const data = (await response.json()) as
        | SecretQnaPayload
        | { error?: string };

      if (!response.ok) {
        setVerifyError(
          "error" in data && data.error
            ? data.error
            : "비밀번호를 다시 확인해주세요",
        );
        return;
      }

      setSecretPayload(data as SecretQnaPayload);
      setPasswordInput("");
      setVerifyError("");
      setExpanded(true);
    } catch {
      setVerifyError("잠시 후 다시 시도해주세요");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleHeaderClick = () => {
    if (item.is_secret && !secretPayload) {
      return;
    }
    setExpanded((prev) => !prev);
  };

  const showContent =
    expanded && (!item.is_secret || secretPayload !== null);
  const displayContent = item.is_secret
    ? secretPayload?.content ?? ""
    : item.content;
  const displayAnswer = item.is_secret
    ? secretPayload?.answer ?? null
    : item.answer ?? null;

  return (
    <div className="border border-[#d0d0d0] rounded-[10px] overflow-hidden">
      {/* Header */}
      <div
        className="flex flex-wrap items-center gap-3 px-4 py-3 bg-white border-b border-[#e5e5e5] cursor-pointer"
        onClick={handleHeaderClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleHeaderClick();
          }
        }}
      >
        <span className="font-semibold text-sm text-foreground shrink-0">
          No. {index}
        </span>
        {item.is_secret && (
          <Lock size={14} className="text-muted-foreground shrink-0" />
        )}
        {item.hasAnswer && (
          <CheckCircle2
            size={14}
            className="text-primary shrink-0"
            aria-label="답변 완료"
          />
        )}

        <span className="text-sm text-muted-foreground">{item.writer_name}</span>

        <span className="text-xs text-muted-foreground ml-auto">
          {formatDate(item.created_at)}
        </span>
      </div>

      {/* Secret post password prompt */}
      {item.is_secret && !secretPayload && (
        <div className="px-4 py-3 bg-[#fafafa] border-b border-[#e5e5e5]">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="password"
              placeholder="비밀번호"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setVerifyError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleVerify();
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="border border-[#d0d0d0] rounded-md px-2 py-1 text-sm w-28"
            />
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleVerify();
              }}
              disabled={isVerifying}
            >
              {isVerifying ? "확인 중..." : "게시물 보기"}
            </Button>
            {verifyError && (
              <span className="text-sm text-red-500">{verifyError}</span>
            )}
          </div>
          {!expanded && (
            <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
              <Lock size={16} className="mr-2" />
              비밀글입니다. 등록한 비밀번호를 입력하여 확인하세요.
            </div>
          )}
        </div>
      )}

      {/* Body */}
      {showContent && (
        <div className="flex flex-col md:flex-row">
          {/* Character image */}
          <div className="flex items-center justify-center p-4 md:w-[140px] shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={character.src}
              alt={character.label}
              className="w-[100px] h-[120px] md:w-[120px] md:h-[150px] object-contain"
            />
          </div>

          {/* Content area */}
          <div className="flex-1 flex flex-col gap-0">
            {/* Question */}
            <div
              className="p-4 text-sm text-foreground leading-relaxed min-h-[80px]"
              style={{ backgroundColor: "#eaf6f4" }}
            >
              <p className="font-semibold text-xs text-primary mb-1">Q.</p>
              <p className="whitespace-pre-wrap">{displayContent}</p>
            </div>

            {/* Answer */}
            {displayAnswer ? (
              <div
                className="p-4 text-sm text-muted-foreground leading-relaxed min-h-[60px]"
                style={{ backgroundColor: "#f0f0f0" }}
              >
                <p className="font-semibold text-xs text-muted-foreground mb-1">
                  A.
                </p>
                <p className="whitespace-pre-wrap">{displayAnswer}</p>
              </div>
            ) : (
              <div className="bg-[#f9f9f9] p-4 text-sm text-muted-foreground italic min-h-[60px] flex items-center">
                아직 답변이 등록되지 않았습니다.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Non-secret collapsed state */}
      {!item.is_secret && !expanded && (
        <div className="px-4 py-3 text-sm text-muted-foreground bg-[#fafafa]">
          클릭하여 내용을 확인하세요.
        </div>
      )}
    </div>
  );
}
