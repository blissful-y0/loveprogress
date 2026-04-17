"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VALID_KEYWORDS } from "@/lib/schemas/booth-schema";
import type { BoothKeyword } from "@/types/database";
import { ImageUpload } from "./image-upload";

interface AdminBooth {
  id: string;
  name: string;
  password_last4: string | null;
  thumbnail_image_key: string;
  hover_image_key: string | null;
  age_type: "general" | "adult";
  created_at: string;
  updated_at: string;
  keywords: { keyword: BoothKeyword }[];
  participants: { name: string; sns_url: string | null; role_order: number }[];
}

interface Participant {
  name: string;
  snsUrl: string;
}

interface FormState {
  name: string;
  passwordLast4: string;
  thumbnailImageKey: string;
  hoverImageKey: string;
  ageType: "general" | "adult";
  keywords: BoothKeyword[];
  ownerName: string;
  ownerSnsUrl: string;
  participants: Participant[];
}

const INITIAL_FORM: FormState = {
  name: "",
  passwordLast4: "",
  thumbnailImageKey: "",
  hoverImageKey: "",
  ageType: "general",
  keywords: [],
  ownerName: "",
  ownerSnsUrl: "",
  participants: [],
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function BoothManager() {
  const [booths, setBooths] = useState<AdminBooth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchBooths = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/booths");
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { booths: AdminBooth[] };
      setBooths(data.booths);
    } catch {
      setError("부스 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooths();
  }, [fetchBooths]);

  function openCreate() {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setFormError("");
    setDialogOpen(true);
  }

  function openEdit(booth: AdminBooth) {
    setEditingId(booth.id);
    const sorted = [...booth.participants].sort((a, b) => a.role_order - b.role_order);
    const owner = sorted[0];
    const rest = sorted.slice(1);
    setForm({
      name: booth.name,
      passwordLast4: booth.password_last4 ?? "",
      thumbnailImageKey: booth.thumbnail_image_key,
      hoverImageKey: booth.hover_image_key ?? "",
      ageType: booth.age_type,
      keywords: booth.keywords.map((k) => k.keyword),
      ownerName: owner?.name ?? "",
      ownerSnsUrl: owner?.sns_url ?? "",
      participants: rest.map((p) => ({ name: p.name, snsUrl: p.sns_url ?? "" })),
    });
    setFormError("");
    setDialogOpen(true);
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`"${name}" 부스를 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch(`/api/admin/booths/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        alert(data.error ?? "삭제에 실패했습니다.");
        return;
      }
      fetchBooths();
    } catch {
      alert("삭제에 실패했습니다.");
    }
  }

  async function handleSubmit() {
    setFormError("");
    if (!form.name.trim()) { setFormError("부스 이름을 입력해주세요."); return; }
    if (!form.thumbnailImageKey.trim()) { setFormError("썸네일 이미지 키를 입력해주세요."); return; }
    if (form.keywords.length === 0) { setFormError("키워드를 최소 1개 선택해주세요."); return; }
    if (!form.ownerName.trim()) { setFormError("대표자 이름을 입력해주세요."); return; }
    if (form.passwordLast4 && !/^\d{4}$/.test(form.passwordLast4)) {
      setFormError("비밀번호는 숫자 4자리여야 합니다."); return;
    }

    const body = {
      name: form.name.trim(),
      passwordLast4: form.passwordLast4 || undefined,
      thumbnailImageKey: form.thumbnailImageKey.trim(),
      hoverImageKey: form.hoverImageKey.trim() || undefined,
      ageType: form.ageType,
      keywords: form.keywords,
      owner: {
        name: form.ownerName.trim(),
        snsUrl: form.ownerSnsUrl.trim() || undefined,
      },
      participants: form.participants
        .filter((p) => p.name.trim())
        .map((p) => ({ name: p.name.trim(), snsUrl: p.snsUrl.trim() || undefined })),
    };

    setSaving(true);
    try {
      const url = editingId ? `/api/admin/booths/${editingId}` : "/api/admin/booths";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) { setFormError(data.error ?? "저장에 실패했습니다."); return; }
      setDialogOpen(false);
      fetchBooths();
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

  function addParticipant() {
    if (form.participants.length >= 3) return;
    setForm((prev) => ({
      ...prev,
      participants: [...prev.participants, { name: "", snsUrl: "" }],
    }));
  }

  function removeParticipant(idx: number) {
    setForm((prev) => ({
      ...prev,
      participants: prev.participants.filter((_, i) => i !== idx),
    }));
  }

  function updateParticipant(idx: number, field: keyof Participant, value: string) {
    setForm((prev) => ({
      ...prev,
      participants: prev.participants.map((p, i) =>
        i === idx ? { ...p, [field]: value } : p,
      ),
    }));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-text-dark">부스 관리</h2>
          <p className="text-sm text-text-muted mt-0.5">전체 {booths.length}개 부스</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("/api/admin/booths/export", "_blank")}
          >
            엑셀 내보내기
          </Button>
          <Button size="sm" onClick={openCreate}>
            부스 등록
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-text-muted">불러오는 중...</div>
      ) : booths.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-text-muted text-sm">
          등록된 부스가 없습니다.
        </div>
      ) : (
        <div className="border border-[#e0f0ea] rounded-[12px] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#f7fbf9] text-primary text-[12px] font-bold border-b border-[#e0f0ea]">
              <tr>
                <th className="px-4 py-3 text-left">부스명</th>
                <th className="px-4 py-3 text-left">대표자</th>
                <th className="px-4 py-3 text-left">키워드</th>
                <th className="px-4 py-3 text-left">연령</th>
                <th className="px-4 py-3 text-left">등록일</th>
                <th className="px-4 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody>
              {booths.map((booth) => {
                const sorted = [...booth.participants].sort((a, b) => a.role_order - b.role_order);
                const owner = sorted[0];
                return (
                  <tr
                    key={booth.id}
                    className="border-b border-[#f0f0f0] last:border-0 hover:bg-[#f9fdfb]"
                  >
                    <td className="px-4 py-3 font-medium text-[#212121]">{booth.name}</td>
                    <td className="px-4 py-3 text-[#555]">{owner?.name ?? "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {booth.keywords.map((kw) => (
                          <span
                            key={kw.keyword}
                            className="text-[11px] bg-[#e8f7f0] text-primary px-2 py-0.5 rounded-full"
                          >
                            {kw.keyword}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#555]">
                      {booth.age_type === "adult" ? "성인" : "일반"}
                    </td>
                    <td className="px-4 py-3 text-[#888]">{formatDate(booth.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(booth)}
                          className="text-[12px] px-3 py-1 border border-[#e0e0e0] rounded-[7px] hover:border-primary hover:text-primary transition-colors"
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(booth.id, booth.name)}
                          className="text-[12px] px-3 py-1 border border-[#e0e0e0] rounded-[7px] hover:border-red-300 hover:text-red-500 transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "부스 수정" : "부스 등록"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>부스명 *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="부스 이름"
                maxLength={30}
              />
            </div>

            <div className="space-y-1.5">
              <Label>비밀번호 끝 4자리</Label>
              <Input
                value={form.passwordLast4}
                onChange={(e) => setForm((f) => ({ ...f, passwordLast4: e.target.value }))}
                placeholder="숫자 4자리 (선택)"
                maxLength={4}
              />
            </div>

            <div className="space-y-1.5">
              <Label>썸네일 이미지 *</Label>
              <ImageUpload
                value={form.thumbnailImageKey}
                onChange={(url) => setForm((f) => ({ ...f, thumbnailImageKey: url }))}
                folder="booths"
                placeholder="썸네일 이미지 선택"
              />
            </div>

            <div className="space-y-1.5">
              <Label>호버 이미지</Label>
              <ImageUpload
                value={form.hoverImageKey}
                onChange={(url) => setForm((f) => ({ ...f, hoverImageKey: url }))}
                folder="booths"
                placeholder="호버 이미지 선택 (선택)"
              />
            </div>

            <div className="space-y-1.5">
              <Label>연령 구분 *</Label>
              <Select
                value={form.ageType}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, ageType: v as "general" | "adult" }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
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
                    onClick={addParticipant}
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
                    onClick={() => removeParticipant(idx)}
                    className="text-[12px] text-[#aaa] hover:text-red-500 mt-2 transition-colors"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>

            {formError && <p className="text-sm text-destructive">{formError}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                취소
              </Button>
              <Button onClick={handleSubmit} disabled={saving}>
                {saving ? "저장 중..." : editingId ? "수정" : "등록"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
