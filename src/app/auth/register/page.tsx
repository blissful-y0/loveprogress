"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    nickname: "",
    password: "",
    passwordConfirm: "",
    boothName: "",
    phoneLast4: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    if (!formData.nickname.trim()) {
      setError("닉네임을 입력해주세요.");
      return;
    }

    if (formData.nickname.trim().length > 20) {
      setError("닉네임은 20자 이하여야 합니다.");
      return;
    }

    if (formData.password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (formData.phoneLast4 && !/^\d{4}$/.test(formData.phoneLast4)) {
      setError("휴대폰번호 뒷자리는 숫자 4자리여야 합니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 서버에서 원자적으로 auth user + 프로필 생성
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: formData.nickname.trim(),
          email: formData.email,
          password: formData.password,
          boothName: formData.boothName.trim() || undefined,
          phoneLast4: formData.phoneLast4.trim() || undefined,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error ?? "회원가입에 실패했습니다.");
        return;
      }

      // 성공 시 자동 로그인
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        // 가입은 성공했지만 자동 로그인 실패 → 로그인 페이지로 이동
        router.push("/auth/login?registered=true");
        return;
      }

      router.push("/");
    } catch {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-[500px] rounded-[15px] border border-border bg-white p-8 shadow-md sm:p-10">
        {/* Title */}
        <h1 className="mb-8 text-center text-2xl font-bold text-text-dark">
          회원가입
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              placeholder="비밀번호를 입력하세요 (6자 이상)"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => updateField("password", e.target.value)}
              className="h-10 rounded-lg border-border px-3 text-sm"
            />
          </div>

          {/* Password confirm */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="passwordConfirm" className="text-sm text-text-sub">
              비밀번호 확인 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="passwordConfirm"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              required
              value={formData.passwordConfirm}
              onChange={(e) => updateField("passwordConfirm", e.target.value)}
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

          {/* Error message */}
          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* Register button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="mx-auto mt-3 h-[40px] w-full max-w-[420px] rounded-[10px] bg-primary text-base font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? "가입 중..." : "가입하기"}
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
            onClick={() => {
              /* TODO: Discord OAuth 연동 */
            }}
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
