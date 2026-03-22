"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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

const SAVED_EMAIL_KEY = "loveprogress_saved_email";

function FindIdDialog() {
  const [nickname, setNickname] = useState("");
  const [boothName, setBoothName] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleFindId() {
    setError("");
    setResult("");
    if (!nickname.trim()) { setError("닉네임을 입력해주세요."); return; }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/find-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: nickname.trim(), boothName: boothName.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "아이디 찾기에 실패했습니다."); return; }
      setResult(data.maskedEmail);
    } catch { setError("서버 오류가 발생했습니다."); }
    finally { setIsLoading(false); }
  }

  return (
    <Dialog onOpenChange={() => { setNickname(""); setBoothName(""); setResult(""); setError(""); }}>
      <DialogTrigger className="px-2 transition-colors hover:text-text-dark cursor-pointer">
        ID찾기
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>ID 찾기</DialogTitle>
          <DialogDescription>가입 시 등록한 닉네임으로 이메일(ID)을 찾을 수 있습니다.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="find-nickname" className="text-sm text-text-sub">닉네임 <span className="text-destructive">*</span></Label>
            <Input id="find-nickname" placeholder="닉네임을 입력하세요" value={nickname} onChange={(e) => setNickname(e.target.value)} className="h-10" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="find-booth" className="text-sm text-text-sub">부스이름 <span className="text-xs font-normal text-text-light">(선택)</span></Label>
            <Input id="find-booth" placeholder="부스이름을 입력하세요" value={boothName} onChange={(e) => setBoothName(e.target.value)} className="h-10" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {result && (
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-sm text-text-sub">가입된 이메일</p>
              <p className="mt-1 text-base font-semibold text-text-dark">{result}</p>
            </div>
          )}
          <Button type="button" onClick={handleFindId} disabled={isLoading} className="h-10 w-full rounded-[10px] bg-primary text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50">
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

  async function handleReset() {
    setError(""); setSuccess(false);
    if (!email.trim()) { setError("이메일을 입력해주세요."); return; }
    if (phoneLast4.trim().length !== 4) { setError("전화번호 뒷자리 4자리를 입력해주세요."); return; }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), phoneLast4: phoneLast4.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "비밀번호 재설정에 실패했습니다."); return; }
      setSuccess(true);
    } catch { setError("서버 오류가 발생했습니다."); }
    finally { setIsLoading(false); }
  }

  return (
    <Dialog onOpenChange={() => { setEmail(""); setPhoneLast4(""); setSuccess(false); setError(""); }}>
      <DialogTrigger className="px-2 transition-colors hover:text-text-dark cursor-pointer">
        비밀번호 재설정
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>비밀번호 재설정</DialogTitle>
          <DialogDescription>가입한 이메일과 전화번호 뒷자리를 입력하면 비밀번호가 초기화됩니다.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reset-email" className="text-sm text-text-sub">이메일 <span className="text-destructive">*</span></Label>
            <Input id="reset-email" type="email" placeholder="이메일을 입력하세요" value={email} onChange={(e) => setEmail(e.target.value)} className="h-10" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reset-phone" className="text-sm text-text-sub">전화번호 뒷자리 <span className="text-destructive">*</span></Label>
            <Input id="reset-phone" inputMode="numeric" maxLength={4} placeholder="뒷자리 4자리" value={phoneLast4} onChange={(e) => setPhoneLast4(e.target.value.replace(/\D/g, "").slice(0, 4))} className="h-10" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && (
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-sm text-text-dark">비밀번호가 초기화되었습니다. 관리자에게 초기 비밀번호를 문의하세요.</p>
              <p className="mt-1 text-xs text-text-light">로그인 후 비밀번호를 변경해주세요.</p>
            </div>
          )}
          <Button type="button" onClick={handleReset} disabled={isLoading || success} className="h-10 w-full rounded-[10px] bg-primary text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50">
            {isLoading ? "처리 중..." : "비밀번호 재설정"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saveId, setSaveId] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      const savedEmail = localStorage.getItem(SAVED_EMAIL_KEY);
      if (savedEmail) { setEmail(savedEmail); setSaveId(true); }
    }
  }, [open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError(authError.message === "Invalid login credentials" ? "이메일 또는 비밀번호가 올바르지 않습니다." : authError.message);
        return;
      }
      if (saveId) localStorage.setItem(SAVED_EMAIL_KEY, email);
      else localStorage.removeItem(SAVED_EMAIL_KEY);
      onOpenChange(false);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] p-8">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-text-dark">로그인</DialogTitle>
          <DialogDescription className="sr-only">이메일과 비밀번호로 로그인하세요</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="modal-email" className="text-sm text-text-sub">이메일</Label>
            <Input id="modal-email" type="email" placeholder="이메일을 입력하세요" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="modal-password" className="text-sm text-text-sub">비밀번호</Label>
            <Input id="modal-password" type="password" placeholder="비밀번호를 입력하세요" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-11" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex items-center gap-2">
            <Checkbox id="modal-save-id" checked={saveId} onCheckedChange={(c) => setSaveId(c === true)} />
            <Label htmlFor="modal-save-id" className="cursor-pointer text-sm font-normal text-text-muted">이메일 저장</Label>
          </div>
          <Button type="submit" disabled={isSubmitting} className="mt-1 h-[50px] w-full rounded-[10px] bg-primary text-base font-semibold text-white hover:bg-primary/90 disabled:opacity-50">
            {isSubmitting ? "로그인 중..." : "로그인"}
          </Button>
        </form>

        <div className="mt-4 flex items-center justify-center gap-1 text-sm text-text-muted">
          <FindIdDialog />
          <span className="text-border-light">|</span>
          <ResetPasswordDialog />
          <span className="text-border-light">|</span>
          <Link href="/auth/register" onClick={() => onOpenChange(false)} className="px-2 transition-colors hover:text-text-dark">
            회원가입
          </Link>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-text-light">간편 로그인</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="mt-4 flex items-center justify-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <button type="button" className="overflow-hidden rounded-full transition-opacity hover:opacity-80" onClick={() => {/* TODO: Discord OAuth */}} aria-label="Discord로 로그인">
            <img src="/img/login/discord_i.jpg" alt="Discord" width={48} height={48} className="size-12 rounded-full object-cover" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <button type="button" className="overflow-hidden rounded-full transition-opacity hover:opacity-80" onClick={() => {/* TODO: Discord OAuth */}} aria-label="Discord 간편 로그인">
            <img src="/img/login/discord_i2.jpg" alt="Discord 간편" width={48} height={48} className="size-12 rounded-full object-cover" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
