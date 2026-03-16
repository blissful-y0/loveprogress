"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/lib/supabase/client";

const SAVED_EMAIL_KEY = "loveprogress_saved_email";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saveId, setSaveId] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem(SAVED_EMAIL_KEY);
    if (savedEmail) {
      setEmail(savedEmail);
      setSaveId(true);
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message === "Invalid login credentials") {
          setError("이메일 또는 비밀번호가 올바르지 않습니다.");
        } else {
          setError(authError.message);
        }
        return;
      }

      if (saveId) {
        localStorage.setItem(SAVED_EMAIL_KEY, email);
      } else {
        localStorage.removeItem(SAVED_EMAIL_KEY);
      }

      router.push("/");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-[500px] rounded-[15px] border border-border bg-white p-8 shadow-md sm:p-10">
        {/* Title */}
        <h1 className="mb-8 text-center text-2xl font-bold text-text-dark">
          로그인
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="text-sm text-text-sub">
              이메일
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="이메일을 입력하세요"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-lg border-border px-3 text-sm"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password" className="text-sm text-text-sub">
              비밀번호
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-lg border-border px-3 text-sm"
            />
          </div>

          {/* Error message */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* Save email checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="save-id"
              checked={saveId}
              onCheckedChange={(checked) => setSaveId(checked === true)}
            />
            <Label
              htmlFor="save-id"
              className="cursor-pointer text-sm font-normal text-text-muted"
            >
              이메일 저장
            </Label>
          </div>

          {/* Login button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="mx-auto mt-2 h-[50px] w-full max-w-[400px] rounded-[10px] bg-primary text-base font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? "로그인 중..." : "로그인"}
          </Button>
        </form>

        {/* Links */}
        <div className="mt-6 flex items-center justify-center gap-1 text-sm text-text-muted">
          <span
            className="relative px-2 opacity-50 cursor-not-allowed"
            title="준비중"
            onClick={(e) => e.preventDefault()}
          >
            ID찾기
          </span>
          <span className="text-border-light">|</span>
          <span
            className="relative px-2 opacity-50 cursor-not-allowed"
            title="준비중"
            onClick={(e) => e.preventDefault()}
          >
            비밀번호 재설정
          </span>
          <span className="text-border-light">|</span>
          <Link
            href="/auth/register"
            className="px-2 transition-colors hover:text-text-dark"
          >
            회원가입
          </Link>
        </div>

        {/* Social login divider */}
        <div className="mt-8 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-text-light">간편 로그인</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Social login icons */}
        <div className="mt-5 flex items-center justify-center gap-4">
          <button
            type="button"
            className="overflow-hidden rounded-full transition-opacity hover:opacity-80"
            onClick={() => { /* TODO: Discord OAuth 연동 */ }}
            aria-label="Discord로 로그인"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/login/discord_i.jpg"
              alt="Discord"
              width={48}
              height={48}
              className="size-12 rounded-full object-cover"
            />
          </button>
          <button
            type="button"
            className="overflow-hidden rounded-full transition-opacity hover:opacity-80"
            onClick={() => { /* TODO: Discord OAuth 연동 */ }}
            aria-label="Discord 간편 로그인"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/login/discord_i2.jpg"
              alt="Discord 간편"
              width={48}
              height={48}
              className="size-12 rounded-full object-cover"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
