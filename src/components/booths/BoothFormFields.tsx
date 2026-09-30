"use client";
import type { Dispatch, SetStateAction } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/booths/ImageUpload";
import { VALID_KEYWORDS } from "@/lib/schemas/booth-schema";
import { BOOTH_ROWS } from "@/lib/booth-layout";
import type { BoothKeyword } from "@/types/database";
interface Participant {
  name: string;
  snsUrl: string;
}

export interface FormState {
  row: string;
  column: string;
  infoUrl: string;
  authorUserId: string;
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

export const INITIAL_FORM: FormState = {
  row: "",
  column: "",
  infoUrl: "",
  authorUserId: "",
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

export default function BoothFormFields({form, setForm, promotion = false, preview = false, onUploadingChange}: {form:FormState; setForm:Dispatch<SetStateAction<FormState>>; promotion?:boolean; preview?:boolean; onUploadingChange?:(value:boolean)=>void}) {
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

return <>{/* Existing booth form shared by admin and promotion */}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label htmlFor="booth-row">행번 {promotion ? "*" : ""}</Label>
          <select id="booth-row" className="h-10 w-full rounded-lg border border-input bg-white px-3" value={form.row} onChange={e => setForm(f => ({...f, row: e.target.value, column: ""}))}>
            <option value="">선택</option>{BOOTH_ROWS.map(r => <option key={r.name}>{r.name}</option>)}
          </select>
        </div>
        <div className="space-y-1.5"><Label htmlFor="booth-column">열번 {promotion ? "*" : ""}</Label>
          <select id="booth-column" className="h-10 w-full rounded-lg border border-input bg-white px-3" value={form.column} disabled={!form.row} onChange={e => setForm(f => ({...f, column: e.target.value}))}>
            <option value="">선택</option>{Array.from({length: BOOTH_ROWS.find(r => r.name === form.row)?.count ?? 0}, (_, i) => <option key={i} value={i+1}>{i+1}</option>)}
          </select>
        </div>
      </div>
      <div className="space-y-1.5"><Label htmlFor="booth-info">인포 링크</Label><Input id="booth-info" value={form.infoUrl} onChange={e => setForm(f => ({...f, infoUrl:e.target.value}))} placeholder="https:// (선택)" /></div>
      {!promotion && <div className="space-y-1.5"><Label htmlFor="booth-author">작성자 계정 ID</Label><Input id="booth-author" value={form.authorUserId} onChange={e => setForm(f => ({...f, authorUserId:e.target.value}))} placeholder="부스어 계정 UUID (선택)" /><p className="text-xs text-text-muted">기존 부스를 해당 부스어 계정과 연결합니다.</p></div>}
            <div className="space-y-1.5">
              <Label>부스명 *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="부스 이름"
                maxLength={30}
              />
            </div>

            {!promotion && <>
            <div className="space-y-1.5">
              <Label>비밀번호 끝 4자리</Label>
              <Input
                value={form.passwordLast4}
                onChange={(e) => setForm((f) => ({ ...f, passwordLast4: e.target.value }))}
                placeholder="숫자 4자리 (선택)"
                maxLength={4}
              />
            </div>

            </>}
            <div className="space-y-1.5">
              <Label>썸네일 이미지 *</Label>
              <ImageUpload
                value={form.thumbnailImageKey}
                onChange={(url) => setForm((f) => ({ ...f, thumbnailImageKey: url }))}
                folder="booths"
                uploadEndpoint={promotion ? "/api/booth-promotion/upload" : undefined}
                preview={preview}
                onUploadingChange={onUploadingChange}
                placeholder="썸네일 이미지 선택"
              />
              <p className="text-[11px] text-[#888] leading-relaxed">
                권장 비율 <strong>14:10 (1.43:1)</strong> · 권장 사이즈 <strong>942×660px</strong> (최소 628×440px)
                <br />
                다른 비율로 올리면 부스카드에서 상하 또는 좌우가 잘릴 수 있습니다.
              </p>
            </div>

            {!promotion && <>
            <div className="space-y-1.5">
              <Label>호버 이미지</Label>
              <ImageUpload
                value={form.hoverImageKey}
                onChange={(url) => setForm((f) => ({ ...f, hoverImageKey: url }))}
                folder="booths"
                uploadEndpoint={promotion ? "/api/booth-promotion/upload" : undefined}
                preview={preview}
                onUploadingChange={onUploadingChange}
                placeholder="호버 이미지 선택 (선택)"
              />
              <p className="text-[11px] text-[#888] leading-relaxed">
                썸네일과 동일한 사이즈 권장 (14:10 · 942×660px)
              </p>
            </div>

            </>}
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

</>;
}
