"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import type { QnaItem } from "../_lib/types";
import { CHARACTERS } from "../_lib/constants";

export function QnaCard({ item }: { item: QnaItem }) {
  const [passwordInput, setPasswordInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  const character = CHARACTERS.find((c) => c.id === item.characterId);

  // TODO: POST /api/qna/:id/verify-password API 연동 필요 — 현재는 mock (비밀번호: 1234)
  const handleVerify = () => {
    if (passwordInput === "1234") {
      setUnlocked(true);
      setVerifyError("");
    } else {
      setVerifyError("비밀번호가 일치하지 않습니다");
    }
  };

  const showContent = !item.isSecret || unlocked;

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

        {item.isSecret && !unlocked && (
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
            >
              게시물 보기
            </Button>
            {verifyError && (
              <span className="text-sm text-red-500">{verifyError}</span>
            )}
          </>
        )}

        {(!item.isSecret || unlocked) && (
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
              {item.content}
            </div>

            {/* Answer */}
            {item.answer && (
              <div className="bg-muted p-4 text-sm text-muted-foreground leading-relaxed min-h-[60px]">
                <p className="font-semibold text-xs text-muted-foreground mb-1">
                  A.
                </p>
                {item.answer}
              </div>
            )}

            {!item.answer && (
              <div className="bg-[#f9f9f9] p-4 text-sm text-muted-foreground italic min-h-[60px] flex items-center">
                아직 답변이 등록되지 않았습니다.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          <Lock size={16} className="mr-2" />
          비밀글입니다. 비밀번호를 입력하여 확인하세요.
        </div>
      )}
    </div>
  );
}
