"use client";

import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { PrivacyModal } from "./privacy-modal";
import { CHARACTERS, PLACEHOLDER_TEXT } from "../_lib/constants";

interface WriteFormProps {
  onPostCreated: () => void;
  totalCount: number;
}

export function WriteForm({ onPostCreated, totalCount }: WriteFormProps) {
  const [selectedCharKey, setSelectedCharKey] = useState<string>(CHARACTERS[0].key);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isSecret, setIsSecret] = useState(false);
  const [content, setContent] = useState("");
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const selectedCharacter = CHARACTERS.find((c) => c.key === selectedCharKey)!;

  const handleSubmit = async () => {
    if (!name.trim()) { setFormError("이름을 입력해주세요."); return; }
    if (!password.trim()) { setFormError("비밀번호를 입력해주세요."); return; }
    if (!content.trim()) { setFormError("내용을 입력해주세요."); return; }
    if (!privacyAgreed) { setFormError("개인정보 수집 및 이용에 동의해주세요."); return; }

    setFormError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/qna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          writerName: name.trim(),
          password,
          isSecret,
          imageKey: selectedCharKey,
          content: content.trim(),
          consentToPrivacy: true,
        }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) { setFormError(data.error ?? "글 작성에 실패했습니다."); return; }

      setName("");
      setPassword("");
      setContent("");
      setIsSecret(false);
      setPrivacyAgreed(false);
      setSelectedCharKey(CHARACTERS[0].key);
      onPostCreated();
    } catch {
      setFormError("잠시 후 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-[18px] overflow-hidden border border-[#e0f0ea] shadow-sm mb-6">
      {/* Header bar */}
      <div className="bg-primary px-5 py-3 text-[13px] font-bold text-white tracking-wide">
        깨달음의 나무 정원 · 상담 접수
      </div>

      {/* Body */}
      <div className="bg-white px-5 py-5 flex gap-5 items-start">
        {/* Photo trigger (Popover) */}
        <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
          <div className="shrink-0">
            <Popover.Trigger asChild>
              <button
                type="button"
                className="w-[100px] h-[120px] rounded-[10px] overflow-hidden bg-[#fafafa] relative group focus:outline-none"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedCharacter.src}
                  alt={selectedCharacter.label}
                  className="w-full h-full object-cover"
                />
                <span className="absolute inset-0 bg-primary/75 flex items-center justify-center text-white text-[13px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  변경
                </span>
              </button>
            </Popover.Trigger>
          </div>

          <Popover.Portal>
            <Popover.Content
              side="bottom"
              align="start"
              sideOffset={8}
              className="z-50 bg-white rounded-2xl shadow-xl border border-[#e0f0ea] p-5 w-[320px]"
            >
              <Popover.Arrow className="fill-[#e0f0ea]" />
              <p className="text-[12px] font-bold text-primary tracking-wide mb-3">증명사진 선택</p>
              <div className="grid grid-cols-4 gap-2">
                {CHARACTERS.map((char) => (
                  <button
                    key={char.key}
                    type="button"
                    onClick={() => { setSelectedCharKey(char.key); setPopoverOpen(false); }}
                    className={`flex flex-col items-center gap-1.5 p-1.5 rounded-[10px] border-2 transition-all ${
                      selectedCharKey === char.key
                        ? "border-primary bg-primary/5"
                        : "border-transparent hover:bg-[#f0f9f6]"
                    }`}
                  >
                    <div className={`w-[58px] h-[70px] rounded-[7px] overflow-hidden border ${
                      selectedCharKey === char.key ? "border-primary" : "border-[#ddf0e8]"
                    }`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={char.src} alt={char.label} className="w-full h-full object-cover" />
                    </div>
                    <span className={`text-[9.5px] text-center leading-tight word-break ${
                      selectedCharKey === char.key ? "text-primary font-bold" : "text-[#707070]"
                    }`}>{char.label}</span>
                  </button>
                ))}
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {/* Form fields */}
        <div className="flex-1 flex flex-col gap-3.5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-[12px] font-bold text-primary tracking-wide pl-3.5">성명</label>
              <input
                type="text"
                placeholder="이름을 입력하세요"
                maxLength={20}
                value={name}
                onChange={(e) => { setName(e.target.value); setFormError(""); }}
                className="h-[42px] border-[1.5px] border-[#e0e0e0] rounded-[9px] px-3.5 text-[15px] text-[#909090] bg-transparent focus:outline-none focus:border-primary placeholder:text-[12px] placeholder:font-light placeholder:text-[#bbb]"
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-[12px] font-bold text-primary tracking-wide pl-3.5">비밀번호</label>
              <input
                type="password"
                placeholder="4~10자리"
                maxLength={10}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFormError(""); }}
                className="h-[42px] border-[1.5px] border-[#e0e0e0] rounded-[9px] px-3.5 text-[15px] text-[#909090] bg-transparent focus:outline-none focus:border-primary placeholder:text-[12px] placeholder:font-light placeholder:text-[#bbb]"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-primary tracking-wide pl-3.5">문의 내용</label>
            <textarea
              placeholder={PLACEHOLDER_TEXT}
              value={content}
              onChange={(e) => { setContent(e.target.value); setFormError(""); }}
              maxLength={2000}
              className="border-[1.5px] border-[#e0e0e0] rounded-[9px] px-3.5 py-3 text-[15px] text-[#909090] bg-transparent resize-none h-[90px] leading-relaxed focus:outline-none focus:border-primary placeholder:text-[12px] placeholder:font-light placeholder:text-[#bbb]"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-[#f0f0f0] px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1.5 text-[13px] text-[#707070]">
          <div className="flex items-center gap-1.5">
            <span>개인정보 수집 동의</span>
            <PrivacyModal />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={privacyAgreed}
                onChange={(e) => { setPrivacyAgreed(e.target.checked); setFormError(""); }}
                className="accent-primary"
              />
              동의함
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isSecret}
                onChange={(e) => setIsSecret(e.target.checked)}
                className="accent-primary"
              />
              비밀글
            </label>
          </div>
          <span className="text-[12px] text-[#bbb]">총 {totalCount}개의 문의</span>
        </div>
        <div className="flex flex-col items-end gap-1">
          {formError && <p className="text-[13px] text-red-500">{formError}</p>}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-primary text-white rounded-[8px] px-7 py-1.5 text-[13px] font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "접수 중..." : "접수하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
