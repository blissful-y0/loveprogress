"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CheckStatus = "idle" | "checking" | "available" | "taken";

interface NicknameChangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentNickname: string;
  onNicknameChanged: () => void;
}

export default function NicknameChangeModal({
  open,
  onOpenChange,
  currentNickname,
  onNicknameChanged,
}: NicknameChangeModalProps) {
  const [nickname, setNickname] = useState("");
  const [checkStatus, setCheckStatus] = useState<CheckStatus>("idle");
  const [checkedNickname, setCheckedNickname] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const resetState = () => {
    setNickname("");
    setCheckStatus("idle");
    setCheckedNickname("");
    setError("");
    setIsSubmitting(false);
    setIsSuccess(false);
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      resetState();
    }
    onOpenChange(value);
  };

  const handleNicknameChange = (value: string) => {
    setNickname(value);
    setCheckStatus("idle");
    setCheckedNickname("");
    setError("");
  };

  const handleCheckNickname = async () => {
    const trimmed = nickname.trim();
    if (!trimmed) {
      setError("닉네임을 입력해주세요.");
      return;
    }
    if (trimmed.length > 20) {
      setError("닉네임은 20자 이하여야 합니다.");
      return;
    }

    setError("");
    setCheckStatus("checking");

    try {
      const res = await fetch("/api/auth/check-nickname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "닉네임 확인에 실패했습니다.");
        setCheckStatus("idle");
        return;
      }

      setCheckStatus(data.available ? "available" : "taken");
      setCheckedNickname(trimmed);
    } catch {
      setError("서버 오류가 발생했습니다.");
      setCheckStatus("idle");
    }
  };

  const handleSubmit = async () => {
    const trimmed = nickname.trim();
    if (!trimmed) {
      setError("닉네임을 입력해주세요.");
      return;
    }

    if (checkStatus !== "available" || checkedNickname !== trimmed) {
      setError("닉네임 중복확인을 해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/auth/update-nickname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "닉네임 변경에 실패했습니다.");
        return;
      }

      setIsSuccess(true);
      onNicknameChanged();
    } catch {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>닉네임 변경</DialogTitle>
          <DialogDescription>
            다른 사용자에게 표시될 닉네임을 설정해주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-2">
          {!isSuccess ? (
            <>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-text-light">현재 닉네임</p>
                <p className="mt-0.5 text-sm font-medium text-text-dark">
                  {currentNickname}
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="new-nickname" className="text-sm text-text-sub">
                  새 닉네임
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="new-nickname"
                    type="text"
                    placeholder="새 닉네임을 입력하세요"
                    value={nickname}
                    onChange={(e) => handleNicknameChange(e.target.value)}
                    maxLength={20}
                    className="h-10 flex-1 rounded-lg border-border px-3 text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCheckNickname}
                    disabled={
                      checkStatus === "checking" || !nickname.trim()
                    }
                    className="h-10 shrink-0 rounded-lg border-border px-3 text-xs font-medium"
                  >
                    {checkStatus === "checking" ? "확인 중..." : "중복확인"}
                  </Button>
                </div>
                {checkStatus === "available" && (
                  <p className="text-xs text-green-600">
                    사용 가능한 닉네임입니다.
                  </p>
                )}
                {checkStatus === "taken" && (
                  <p className="text-xs text-destructive">
                    이미 사용 중인 닉네임입니다.
                  </p>
                )}
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || checkStatus !== "available"}
                className="h-10 w-full rounded-[10px] bg-primary text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmitting ? "변경 중..." : "닉네임 변경"}
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="rounded-lg bg-muted/50 p-4 text-center w-full">
                <p className="text-sm text-text-sub">
                  닉네임이 변경되었습니다.
                </p>
                <p className="mt-1 text-base font-semibold text-text-dark">
                  {checkedNickname}
                </p>
              </div>
              <Button
                type="button"
                onClick={() => handleOpenChange(false)}
                className="h-10 w-full rounded-[10px] bg-primary text-sm font-semibold text-white hover:bg-primary/90"
              >
                확인
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
