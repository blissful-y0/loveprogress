"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import type { QnaItem, SecretQnaPayload } from "../_lib/types";
import { CHARACTERS } from "../_lib/constants";

export function QnaCard({ item }: { item: QnaItem }) {
  const [passwordInput, setPasswordInput] = useState("");
  const [secretPayload, setSecretPayload] = useState<SecretQnaPayload | null>(
    null,
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  const character = CHARACTERS.find((c) => c.id === item.characterId);

  const handleVerify = async () => {
    if (!passwordInput.trim()) {
      setVerifyError("비밀번호를 입력해주세요");
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch(`/api/qna/${item.id}/verify-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
    } catch {
      setVerifyError("잠시 후 다시 시도해주세요");
    } finally {
      setIsVerifying(false);
    }
  };

  const showContent = !item.isSecret || secretPayload !== null;
  const displayContent = item.isSecret ? secretPayload?.content ?? "" : item.content;
  const displayAnswer = item.isSecret
    ? secretPayload?.answer ?? null
    : item.answer ?? null;

  return (
    <div className="border border-[#d0d0d0] rounded-[10px] overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-white border-b border-[#e5e5e5]">
        <span className="font-semibold text-sm text-foreground shrink-0">
          No. {item.id}
        </span>
        {item.isSecret && (
          <Lock size={14} className="text-muted-foreground shrink-0" />
        )}

        {item.isSecret && !secretPayload && (
          <>
            <input
              type="text"
              value={item.name}
              readOnly
              className="border border-[#d0d0d0] rounded-md px-2 py-1 text-sm w-24 bg-[#f9f9f9] text-muted-foreground"
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setVerifyError("");
              }}
              className="border border-[#d0d0d0] rounded-md px-2 py-1 text-sm w-28"
            />
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm"
              onClick={handleVerify}
              disabled={isVerifying}
            >
              {isVerifying ? "확인 중..." : "게시물 보기"}
            </Button>
            {verifyError && (
              <span className="text-sm text-red-500">{verifyError}</span>
            )}
          </>
        )}

        {(!item.isSecret || secretPayload) && (
          <span className="text-sm text-muted-foreground">{item.name}</span>
        )}
      </div>

      {/* Body */}
      {showContent ? (
        <div className="flex flex-col md:flex-row">
          {/* Character image */}
          <div className="flex items-center justify-center p-4 md:w-[140px] shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={character?.src}
              alt={character?.label ?? "character"}
              className="w-[100px] h-[120px] md:w-[120px] md:h-[150px] object-contain"
            />
          </div>

          {/* Content area */}
          <div className="flex-1 flex flex-col gap-0">
            {/* Question */}
            <div className="bg-primary/10 p-4 text-sm text-foreground leading-relaxed min-h-[80px]">
              <p className="font-semibold text-xs text-primary mb-1">Q.</p>
              {displayContent}
            </div>

            {/* Answer */}
            {displayAnswer && (
              <div className="bg-muted p-4 text-sm text-muted-foreground leading-relaxed min-h-[60px]">
                <p className="font-semibold text-xs text-muted-foreground mb-1">
                  A.
                </p>
                {displayAnswer}
              </div>
            )}

            {!displayAnswer && (
              <div className="bg-[#f9f9f9] p-4 text-sm text-muted-foreground italic min-h-[60px] flex items-center">
                아직 답변이 등록되지 않았습니다.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          <Lock size={16} className="mr-2" />
          비밀글입니다. 등록한 비밀번호를 입력하여 확인하세요.
        </div>
      )}
    </div>
  );
}
