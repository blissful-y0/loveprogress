"use client";

import { useEffect, useMemo, useState } from "react";

import { ImageUpload } from "@/app/admin/_components/image-upload";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BOOTH_ROW_MAX, BOOTH_ROWS, boothPositionKey, type BoothRowLabel } from "@/lib/booth-layout";
import { NO_ACCOUNT, sortAccountsFor, useBoothAccounts } from "@/hooks/useBoothAccounts";
import { VALID_KEYWORDS } from "@/lib/schemas/booth-schema";
import type { BoothCardData } from "@/types/booth";
import type { BoothKeyword } from "@/types/database";

interface Participant {
  name: string;
  snsUrl: string;
}

interface FormState {
  rowLabel: BoothRowLabel | "";
  colNo: number | null;
  name: string;
  thumbnailImageKey: string;
  infoUrl: string;
  ageType: "general" | "adult";
  keywords: BoothKeyword[];
  ownerName: string;
  ownerSnsUrl: string;
  participants: Participant[];
  // 관리자 전용
  passwordLast4: string;
  hoverImageKey: string;
  userId: string;
}

const INITIAL_FORM: FormState = {
  rowLabel: "",
  colNo: null,
  name: "",
  thumbnailImageKey: "",
  infoUrl: "",
  ageType: "general",
  keywords: [],
  ownerName: "",
  ownerSnsUrl: "",
  participants: [],
  passwordLast4: "",
  hoverImageKey: "",
  userId: NO_ACCOUNT,
};

function toForm(booth: BoothCardData): FormState {
  return {
    rowLabel: (booth.rowLabel as BoothRowLabel | null) ?? "",
    colNo: booth.colNo,
    name: booth.name,
    thumbnailImageKey: booth.thumbnailImageKey,
    infoUrl: booth.infoUrl ?? "",
    ageType: booth.ageType,
    keywords: [...booth.keywords],
    ownerName: booth.owner.name,
    ownerSnsUrl: booth.owner.snsUrl ?? "",
    participants: booth.participants.map((p) => ({ name: p.name, snsUrl: p.snsUrl ?? "" })),
    passwordLast4: "",
    hoverImageKey: booth.hoverImageKey ?? "",
    userId: booth.userId ?? NO_ACCOUNT,
  };
}

interface BoothPromoFormDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  /** 수정할 부스. null이면 새로 등록 */
  readonly booth: BoothCardData | null;
  /** 다른 부스가 차지한 위치("행-열") */
  readonly occupied: ReadonlySet<string>;
  readonly onSaved: () => void;
  /** 관리자: 비밀번호·호버 이미지·담당 계정까지 수정 (관리자 API 사용) */
  readonly isAdmin?: boolean;
  /** 미리보기: 관리자 데이터 요청·저장을 하지 않음 */
  readonly preview?: boolean;
}

export default function BoothPromoFormDialog({
  open,
  onOpenChange,
  booth,
  occupied,
  onSaved,
  isAdmin = false,
  preview = false,
}: BoothPromoFormDialogProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  // 비밀번호는 공개 데이터에 없어서 관리자 API로 따로 불러옴.
  // 불러오기에 성공하기 전에는 저장을 막는다 (빈 값으로 덮어쓰기 방지)
  const [adminDataReady, setAdminDataReady] = useState(true);
  const { accounts, nicknameById } = useBoothAccounts(isAdmin && open);
  const sortedAccounts = useMemo(
    () => sortAccountsFor(accounts, form.name, form.ownerName),
    [accounts, form.name, form.ownerName],
  );

  useEffect(() => {
    if (!open) return;
    setForm(booth ? toForm(booth) : INITIAL_FORM);
    setFormError("");
    const needsAdminData = isAdmin && !!booth && !preview;
    setAdminDataReady(!needsAdminData);
    if (!needsAdminData) return;

    let cancelled = false;
    fetch("/api/admin/booths")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: { booths: { id: string; password_last4: string | null }[] }) => {
        const row = data.booths.find((b) => b.id === booth.id);
        if (!row) throw new Error("not found");
        if (cancelled) return;
        setForm((f) => ({ ...f, passwordLast4: row.password_last4 ?? "" }));
        setAdminDataReady(true);
      })
      .catch(() => {
        if (!cancelled) setFormError("부스 정보를 불러오지 못했습니다. 다시 열어주세요.");
      });
    return () => {
      cancelled = true;
    };
  }, [open, booth, isAdmin, preview]);

  const isTaken = (row: BoothRowLabel, col: number) => {
    const key = boothPositionKey(row, col);
    const own = booth?.rowLabel && booth.colNo ? boothPositionKey(booth.rowLabel, booth.colNo) : null;
    return occupied.has(key) && key !== own;
  };

  async function handleSubmit() {
    setFormError("");
    if (preview) { setFormError("미리보기에서는 저장되지 않습니다."); return; }
    if (!form.rowLabel || !form.colNo) { setFormError("행번과 열번을 선택해주세요."); return; }
    if (!form.name.trim()) { setFormError("부스 이름을 입력해주세요."); return; }
    if (!form.thumbnailImageKey) { setFormError("썸네일 이미지를 선택해주세요."); return; }
    if (form.keywords.length === 0) { setFormError("키워드를 최소 1개 선택해주세요."); return; }
    if (!form.ownerName.trim()) { setFormError("대표자 이름을 입력해주세요."); return; }
    if (isAdmin && form.passwordLast4 && !/^\d{4}$/.test(form.passwordLast4)) {
      setFormError("비밀번호는 숫자 4자리여야 합니다."); return;
    }

    const body = {
      rowLabel: form.rowLabel,
      colNo: form.colNo,
      name: form.name.trim(),
      thumbnailImageKey: form.thumbnailImageKey,
      infoUrl: form.infoUrl.trim() || undefined,
      ageType: form.ageType,
      keywords: form.keywords,
      owner: { name: form.ownerName.trim(), snsUrl: form.ownerSnsUrl.trim() || undefined },
      participants: form.participants
        .filter((p) => p.name.trim())
        .map((p) => ({ name: p.name.trim(), snsUrl: p.snsUrl.trim() || undefined })),
      ...(isAdmin && {
        passwordLast4: form.passwordLast4 || undefined,
        hoverImageKey: form.hoverImageKey || undefined,
        userId: form.userId === NO_ACCOUNT ? null : form.userId,
      }),
    };

    const url = isAdmin
      ? booth ? `/api/admin/booths/${booth.id}` : "/api/admin/booths"
      : booth ? `/api/booths/${booth.id}` : "/api/booths";
    const method = booth ? (isAdmin ? "PUT" : "PATCH") : "POST";

    setSaving(true);
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) { setFormError(data.error ?? "저장에 실패했습니다."); return; }
      onOpenChange(false);
      onSaved();
    } catch {
      setFormError("잠시 후 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  }

  function toggleKeyword(kw: BoothKeyword) {
    setForm((prev) => ({
      ...prev,
      keywords: prev.keywords.includes(kw)
        ? prev.keywords.filter((k) => k !== kw)
        : [...prev.keywords, kw],
    }));
  }

  function updateParticipant(idx: number, field: keyof Participant, value: string) {
    setForm((prev) => ({
      ...prev,
      participants: prev.participants.map((p, i) => (i === idx ? { ...p, [field]: value } : p)),
    }));
  }

  const maxCol = form.rowLabel ? BOOTH_ROW_MAX[form.rowLabel] : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{booth ? "부스 수정" : "부스 등록"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>행번 *</Label>
            <Select
              value={form.rowLabel}
              onValueChange={(v) => setForm((f) => ({ ...f, rowLabel: v as BoothRowLabel, colNo: null }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="행 선택" />
              </SelectTrigger>
              <SelectContent>
                {BOOTH_ROWS.map((row) => (
                  <SelectItem key={row} value={row}>{row}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>열번 *</Label>
            <Select
              value={form.colNo ? String(form.colNo) : ""}
              onValueChange={(v) => setForm((f) => ({ ...f, colNo: Number(v) }))}
              disabled={!form.rowLabel}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={form.rowLabel ? "열 선택" : "행을 먼저 선택하세요"} />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: maxCol }, (_, i) => i + 1).map((col) => {
                  const taken = form.rowLabel !== "" && isTaken(form.rowLabel, col);
                  return (
                    <SelectItem key={col} value={String(col)} disabled={taken}>
                      {col}{taken ? " (등록됨)" : ""}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>부스명 *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="부스 이름"
              maxLength={30}
            />
          </div>

          {isAdmin && (
            <div className="space-y-1.5">
              <Label>비밀번호 끝 4자리</Label>
              <Input
                value={form.passwordLast4}
                onChange={(e) => setForm((f) => ({ ...f, passwordLast4: e.target.value }))}
                placeholder="숫자 4자리 (선택)"
                maxLength={4}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label>썸네일 이미지 *</Label>
            <ImageUpload
              value={form.thumbnailImageKey}
              onChange={(url) => setForm((f) => ({ ...f, thumbnailImageKey: url }))}
              folder="booths"
              endpoint="/api/booth-board/upload"
              placeholder="썸네일 이미지 선택"
            />
            <p className="text-[11px] text-[#888] leading-relaxed">
              권장 비율 <strong>14:10 (1.43:1)</strong> · 권장 사이즈 <strong>942×660px</strong> (최소 628×440px)
              <br />
              다른 비율로 올리면 부스카드에서 상하 또는 좌우가 잘릴 수 있습니다.
            </p>
          </div>

          {isAdmin && (
            <div className="space-y-1.5">
              <Label>호버 이미지</Label>
              <ImageUpload
                value={form.hoverImageKey}
                onChange={(url) => setForm((f) => ({ ...f, hoverImageKey: url }))}
                folder="booths"
                endpoint="/api/booth-board/upload"
                placeholder="호버 이미지 선택 (선택)"
              />
              <p className="text-[11px] text-[#888] leading-relaxed">
                대학생활 부스카드에만 쓰입니다. 썸네일과 같은 사이즈 권장 (14:10 · 942×660px)
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>인포 링크</Label>
            <Input
              value={form.infoUrl}
              onChange={(e) => setForm((f) => ({ ...f, infoUrl: e.target.value }))}
              placeholder="https:// (선택)"
              maxLength={500}
            />
          </div>

          <div className="space-y-1.5">
            <Label>연령 구분 *</Label>
            <Select
              value={form.ageType}
              onValueChange={(v) => setForm((f) => ({ ...f, ageType: v as "general" | "adult" }))}
            >
              <SelectTrigger>
                <SelectValue>{(v: string) => (v === "adult" ? "성인" : "일반")}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">일반</SelectItem>
                <SelectItem value="adult">성인</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>키워드 * (최소 1개)</Label>
            <div className="flex flex-wrap gap-2">
              {VALID_KEYWORDS.map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => toggleKeyword(kw)}
                  className={`text-[13px] px-3 py-1.5 rounded-[8px] border transition-colors ${
                    form.keywords.includes(kw)
                      ? "bg-primary text-white border-primary font-bold"
                      : "border-[#e0e0e0] text-[#707070] hover:border-primary hover:text-primary"
                  }`}
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>대표자 *</Label>
            <Input
              value={form.ownerName}
              onChange={(e) => setForm((f) => ({ ...f, ownerName: e.target.value }))}
              placeholder="이름"
              maxLength={20}
            />
            <Input
              value={form.ownerSnsUrl}
              onChange={(e) => setForm((f) => ({ ...f, ownerSnsUrl: e.target.value }))}
              placeholder="SNS URL (선택)"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>참여자 ({form.participants.length}/3)</Label>
              {form.participants.length < 3 && (
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, participants: [...f.participants, { name: "", snsUrl: "" }] }))
                  }
                  className="text-[12px] text-primary hover:underline"
                >
                  + 추가
                </button>
              )}
            </div>
            {form.participants.map((p, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <div className="flex-1 space-y-1">
                  <Input
                    value={p.name}
                    onChange={(e) => updateParticipant(idx, "name", e.target.value)}
                    placeholder="이름"
                    maxLength={20}
                  />
                  <Input
                    value={p.snsUrl}
                    onChange={(e) => updateParticipant(idx, "snsUrl", e.target.value)}
                    placeholder="SNS URL (선택)"
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, participants: f.participants.filter((_, i) => i !== idx) }))
                  }
                  className="text-[12px] text-[#aaa] hover:text-red-500 mt-2 transition-colors"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>

          {isAdmin && (
            <div className="space-y-1.5">
              <Label>담당 계정</Label>
              <Select value={form.userId} onValueChange={(v) => setForm((f) => ({ ...f, userId: v ?? NO_ACCOUNT }))}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(v: string) => (v === NO_ACCOUNT ? "연결 안 함" : nicknameById.get(v) ?? "불러오는 중...")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_ACCOUNT}>연결 안 함</SelectItem>
                  {sortedAccounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.nickname}
                      {a.booth_name ? ` · ${a.booth_name}` : ""}
                      {a.role === "admin" ? " (관리자)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-[#888]">연결된 계정은 이 부스를 직접 수정할 수 있습니다.</p>
            </div>
          )}

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              취소
            </Button>
            <Button onClick={handleSubmit} disabled={saving || !adminDataReady}>
              {saving ? "저장 중..." : booth ? "수정" : "등록"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
