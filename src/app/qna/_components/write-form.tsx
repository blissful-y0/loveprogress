"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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

  const selectedCharacter = CHARACTERS.find((c) => c.key === selectedCharKey);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setFormError("이름을 입력해주세요.");
      return;
    }
    if (!password.trim()) {
      setFormError("비밀번호를 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      setFormError("내용을 입력해주세요.");
      return;
    }
    if (!privacyAgreed) {
      setFormError("개인정보 수집 및 이용에 동의해주세요.");
      return;
    }

    setFormError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/qna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          writerName: name.trim(),
          password: password,
          isSecret,
          imageKey: selectedCharKey,
          content: content.trim(),
          consentToPrivacy: true,
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setFormError(data.error ?? "글 작성에 실패했습니다.");
        return;
      }

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
    <div
      className="rounded-[10px] p-5 md:p-8"
      style={{
        background: "linear-gradient(180deg, #c2e5dd 0%, #ffffff 100%)",
      }}
    >
      {/* Top: character select + inputs */}
      <div className="flex flex-col md:flex-row gap-5">
        {/* Left: Selected character image */}
        <div className="flex items-start justify-center md:justify-start shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selectedCharacter?.src}
            alt={selectedCharacter?.label ?? "character"}
            className="w-[120px] h-[150px] md:w-[150px] md:h-[150px] object-contain"
          />
        </div>

        {/* Right: selectors + inputs */}
        <div className="flex-1 space-y-4">
          {/* Character selection circles */}
          <div className="flex flex-wrap items-center gap-2">
            {CHARACTERS.map((char) => (
              <button
                key={char.key}
                onClick={() => setSelectedCharKey(char.key)}
                className={`w-[40px] h-[40px] rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                  selectedCharKey === char.key
                    ? "border-primary ring-2 ring-primary/30 scale-110"
                    : "border-[#d0d0d0] opacity-60 hover:opacity-100"
                }`}
                title={char.label}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={char.src}
                  alt={char.label}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-muted-foreground">
              총 {totalCount}개의 문의가 등록됐어요
            </span>
          </div>

          {/* Name, Password, Secret, Submit */}
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="이름"
              maxLength={20}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setFormError("");
              }}
              className="border border-[#d0d0d0] rounded-md px-3 py-2 text-sm w-full sm:w-32 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              type="password"
              placeholder="비밀번호"
              maxLength={10}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFormError("");
              }}
              className="border border-[#d0d0d0] rounded-md px-3 py-2 text-sm w-full sm:w-32 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <label className="flex items-center gap-1 text-sm text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isSecret}
                onChange={(e) => setIsSecret(e.target.checked)}
                className="accent-primary"
              />
              비밀글
            </label>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm w-full sm:w-auto"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "작성 중..." : "작성하기"}
            </Button>
          </div>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        placeholder={PLACEHOLDER_TEXT}
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setFormError("");
        }}
        maxLength={2000}
        className="mt-4 w-full h-[160px] border border-[#d0d0d0] rounded-[10px] p-4 text-sm text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-[#b0b0b0]"
      />

      {/* Privacy consent */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span>QNA 문의 개인정보 수집 및 이용 동의</span>
        <PrivacyModal />
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={privacyAgreed}
            onChange={(e) => {
              setPrivacyAgreed(e.target.checked);
              setFormError("");
            }}
            className="accent-primary"
          />
          동의함
        </label>
      </div>

      {/* Inline error message */}
      {formError && (
        <p className="mt-2 text-sm text-red-500">{formError}</p>
      )}
    </div>
  );
}
