"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    nickname: "",
    password: "",
    email: "",
    boothName: "",
    phoneLast4: "",
  });
  const [usernameChecked, setUsernameChecked] = useState(false);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "username") {
      setUsernameChecked(false);
    }
  };

  const handleCheckUsername = () => {
    // TODO: API 연동
    setUsernameChecked(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: API 연동
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-[500px] rounded-[15px] border border-border bg-white p-8 shadow-md sm:p-10">
        {/* Title */}
        <h1 className="mb-8 text-center text-2xl font-bold text-text-dark">
          회원가입
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Username with duplicate check */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="username" className="text-sm text-text-sub">
              아이디 <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="username"
                type="text"
                placeholder="아이디를 입력하세요"
                required
                value={formData.username}
                onChange={(e) => updateField("username", e.target.value)}
                className="h-10 flex-1 rounded-lg border-border px-3 text-sm"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleCheckUsername}
                className={`h-10 shrink-0 rounded-lg border px-4 text-sm font-medium ${
                  usernameChecked
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-text-sub hover:bg-muted"
                }`}
              >
                {usernameChecked ? "확인완료" : "중복확인"}
              </Button>
            </div>
          </div>

          {/* Nickname */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nickname" className="text-sm text-text-sub">
              닉네임 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nickname"
              type="text"
              placeholder="닉네임을 입력하세요"
              required
              value={formData.nickname}
              onChange={(e) => updateField("nickname", e.target.value)}
              className="h-10 rounded-lg border-border px-3 text-sm"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password" className="text-sm text-text-sub">
              비밀번호 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              required
              value={formData.password}
              onChange={(e) => updateField("password", e.target.value)}
              className="h-10 rounded-lg border-border px-3 text-sm"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="text-sm text-text-sub">
              이메일 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="이메일을 입력하세요"
              required
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="h-10 rounded-lg border-border px-3 text-sm"
            />
          </div>

          {/* Booth name (optional) */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="boothName" className="text-sm text-text-sub">
              부스이름{" "}
              <span className="text-xs font-normal text-text-light">
                (선택)
              </span>
            </Label>
            <Input
              id="boothName"
              type="text"
              placeholder="부스이름을 입력하세요"
              value={formData.boothName}
              onChange={(e) => updateField("boothName", e.target.value)}
              className="h-10 rounded-lg border-border px-3 text-sm"
            />
          </div>

          {/* Phone last 4 digits (optional) */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phoneLast4" className="text-sm text-text-sub">
              휴대폰번호 뒷자리{" "}
              <span className="text-xs font-normal text-text-light">
                (선택)
              </span>
            </Label>
            <Input
              id="phoneLast4"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="휴대폰번호 뒷자리를 입력하세요"
              value={formData.phoneLast4}
              onChange={(e) => updateField("phoneLast4", e.target.value)}
              maxLength={4}
              className="h-10 rounded-lg border-border px-3 text-sm"
            />
          </div>

          {/* Register button */}
          <Button
            type="submit"
            className="mx-auto mt-3 h-[40px] w-full max-w-[420px] rounded-[10px] bg-primary text-base font-semibold text-white hover:bg-primary/90"
          >
            가입하기
          </Button>
        </form>

        {/* Discord simple register */}
        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-text-light">간편 회원가입</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm text-text-sub transition-colors hover:bg-muted"
            onClick={() => { /* TODO: API 연동 */ }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/login/discord_i.jpg"
              alt="Discord"
              width={24}
              height={24}
              className="size-6 rounded-full object-cover"
            />
            Discord로 간편 가입
          </button>
        </div>

        {/* Login link */}
        <p className="mt-6 text-center text-sm text-text-muted">
          이미 계정이 있으신가요?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-primary hover:underline"
          >
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
