"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";

const SAVED_EMAIL_KEY = "loveprogress_saved_email";

function FindIdDialog() {
  const [nickname, setNickname] = useState("");
  const [boothName, setBoothName] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFindId = async () => {
    setError("");
    setResult("");

    if (!nickname.trim()) {
      setError("닉네임을 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/find-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: nickname.trim(),
          boothName: boothName.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "아이디 찾기에 실패했습니다.");
        return;
      }

      setResult(data.maskedEmail);
    } catch {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      onOpenChange={() => {
        setNickname("");
        setBoothName("");
        setResult("");
        setError("");
      }}
    >
      <DialogTrigger
        className="px-2 transition-colors hover:text-text-dark cursor-pointer"
      >
        ID찾기
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>ID 찾기</DialogTitle>
          <DialogDescription>
            가입 시 등록한 닉네임으로 이메일(ID)을 찾을 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="find-nickname" className="text-sm text-text-sub">
              닉네임 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="find-nickname"
              type="text"
              placeholder="닉네임을 입력하세요"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="h-10 rounded-lg border-border px-3 text-sm"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="find-booth" className="text-sm text-text-sub">
              부스이름{" "}
              <span className="text-xs font-normal text-text-light">
                (선택)
              </span>
            </Label>
            <Input
              id="find-booth"
              type="text"
              placeholder="부스이름을 입력하세요"
              value={boothName}
              onChange={(e) => setBoothName(e.target.value)}
              className="h-10 rounded-lg border-border px-3 text-sm"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {result && (
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-sm text-text-sub">가입된 이메일</p>
              <p className="mt-1 text-base font-semibold text-text-dark">
                {result}
              </p>
            </div>
          )}

          <Button
            type="button"
            onClick={handleFindId}
            disabled={isLoading}
            className="h-10 w-full rounded-[10px] bg-primary text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? "찾는 중..." : "ID 찾기"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ResetPasswordDialog() {
  const [email, setEmail] = useState("");
  const [phoneLast4, setPhoneLast4] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    setError("");
    setSuccess(false);

    if (!email.trim()) {
      setError("이메일을 입력해주세요.");
      return;
    }

    if (!phoneLast4.trim() || phoneLast4.trim().length !== 4) {
      setError("전화번호 뒷자리 4자리를 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          phoneLast4: phoneLast4.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "비밀번호 재설정에 실패했습니다.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      onOpenChange={() => {
        setEmail("");
        setPhoneLast4("");
        setSuccess(false);
        setError("");
      }}
    >
      <DialogTrigger
        className="px-2 transition-colors hover:text-text-dark cursor-pointer"
      >
        비밀번호 재설정
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>비밀번호 재설정</DialogTitle>
          <DialogDescription>
            가입한 이메일과 전화번호 뒷자리를 입력하면 비밀번호가 초기화됩니다.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reset-email" className="text-sm text-text-sub">
              이메일 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 rounded-lg border-border px-3 text-sm"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reset-phone" className="text-sm text-text-sub">
              전화번호 뒷자리 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="reset-phone"
              type="text"
              inputMode="numeric"
              maxLength={4}
              placeholder="뒷자리 4자리를 입력하세요"
              value={phoneLast4}
              onChange={(e) =>
                setPhoneLast4(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              className="h-10 rounded-lg border-border px-3 text-sm"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {success && (
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-sm text-text-dark">
                비밀번호가 초기화되었습니다. 관리자에게 초기 비밀번호를
                문의하세요.
              </p>
              <p className="mt-1 text-xs text-text-light">
                로그인 후 비밀번호를 변경해주세요.
              </p>
            </div>
          )}

          <Button
            type="button"
            onClick={handleResetPassword}
            disabled={isLoading || success}
            className="h-10 w-full rounded-[10px] bg-primary text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? "처리 중..." : "비밀번호 재설정"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
          <FindIdDialog />
          <span className="text-border-light">|</span>
          <ResetPasswordDialog />
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
        <div className="mt-5 flex items-center justify-center">
          <button
            type="button"
            className="flex size-12 items-center justify-center rounded-full bg-[#5865F2] transition-opacity hover:opacity-80"
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signInWithOAuth({
                provider: "discord",
                options: { redirectTo: `${window.location.origin}/auth/callback` },
              });
            }}
            aria-label="Discord로 로그인"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127.14 96.36" className="size-7 fill-white">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
