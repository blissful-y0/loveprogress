"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WithdrawModal({
  open,
  onOpenChange,
}: WithdrawModalProps) {
  const [step, setStep] = useState<"confirm" | "processing">("confirm");
  const [error, setError] = useState("");

  const resetState = () => {
    setStep("confirm");
    setError("");
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) resetState();
    onOpenChange(value);
  };

  const handleWithdraw = async () => {
    setStep("processing");
    setError("");

    try {
      const res = await fetch("/api/auth/withdraw", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "회원 탈퇴에 실패했습니다.");
        setStep("confirm");
        return;
      }

      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch {
      setError("서버 오류가 발생했습니다.");
      setStep("confirm");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>회원 탈퇴</DialogTitle>
          <DialogDescription>
            정말로 탈퇴하시겠습니까?
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-2">
          <div className="rounded-lg bg-red-50 border border-red-100 p-4 text-sm text-red-700 leading-relaxed">
            <p className="font-semibold mb-1">탈퇴 시 유의사항</p>
            <ul className="list-disc pl-4 space-y-1 text-[13px]">
              <li>계정 정보 및 작성한 글이 삭제됩니다.</li>
              <li>삭제된 계정은 복구할 수 없습니다.</li>
            </ul>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={step === "processing"}
              className="h-10 flex-1 rounded-[10px]"
            >
              취소
            </Button>
            <Button
              type="button"
              onClick={handleWithdraw}
              disabled={step === "processing"}
              className="h-10 flex-1 rounded-[10px] bg-red-500 text-white hover:bg-red-600"
            >
              {step === "processing" ? "처리 중..." : "탈퇴하기"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
