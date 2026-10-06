"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PenLineIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useBoothLikes } from "@/hooks/useBoothLikes";
import { useUser } from "@/hooks/useUser";
import { boothPositionKey, type BoothRowLabel } from "@/lib/booth-layout";
import type { BoothCardData } from "@/types/booth";
import BoothDetailModal from "./BoothDetailModal";
import BoothPromoFormDialog from "./BoothPromoFormDialog";
import BoothPromoMap from "./BoothPromoMap";

interface BoothPromoClientProps {
  readonly booths: readonly BoothCardData[];
}

// ponytail: develop(Vercel Preview)·로컬 전용 시점 전환. 로그인 없이 모달 확인용, 정식 오픈 전에 제거
const PREVIEW_ENABLED =
  process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" || process.env.NODE_ENV === "development";
type PreviewRole = "member" | "booth_member" | "admin";
const PREVIEW_ROLES: readonly { value: PreviewRole; label: string }[] = [
  { value: "member", label: "일반" },
  { value: "booth_member", label: "부스어(본인 부스)" },
  { value: "admin", label: "관리자" },
];

const ACTION_BUTTON = "flex h-[30px] w-[80px] items-center justify-center rounded-[4px] text-[16px] font-semibold";

export default function BoothPromoClient({ booths }: BoothPromoClientProps) {
  const router = useRouter();
  const { user } = useUser();
  const { userLikes, toggleLike } = useBoothLikes();

  const [selected, setSelected] = useState<{ row: BoothRowLabel; col: number } | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BoothCardData | null>(null);
  const [previewRole, setPreviewRole] = useState<PreviewRole | null>(null);

  const boothsByPosition = useMemo(() => {
    const map = new Map<string, BoothCardData>();
    for (const booth of booths) {
      if (booth.rowLabel && booth.colNo) map.set(boothPositionKey(booth.rowLabel, booth.colNo), booth);
    }
    return map;
  }, [booths]);
  const occupied = useMemo(() => new Set(boothsByPosition.keys()), [boothsByPosition]);

  const role = previewRole ?? user?.role;
  const canWrite = role === "booth_member" || role === "admin";
  const selectedBooth = selected ? boothsByPosition.get(boothPositionKey(selected.row, selected.col)) : undefined;
  // 미리보기 부스어는 모든 칸을 본인 부스로 취급
  const canEdit =
    !!selectedBooth &&
    (previewRole
      ? previewRole !== "member"
      : !!user && (user.role === "admin" || selectedBooth.userId === user.authUser.id));

  const openForm = (booth: BoothCardData | null) => {
    setSelected(null);
    setEditing(booth);
    setFormOpen(true);
  };

  return (
    <div className="pb-16">
      {PREVIEW_ENABLED && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-[#f0a020] bg-[#fff8e8] px-3 py-2 text-[12px] text-[#8a5a00]">
          <span className="font-semibold">미리보기 (develop 전용, 저장 안 됨)</span>
          {PREVIEW_ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setPreviewRole((prev) => (prev === r.value ? null : r.value))}
              className={`rounded-full px-2.5 py-0.5 ring-1 ring-inset cursor-pointer ${
                previewRole === r.value ? "bg-[#f0a020] text-white ring-[#f0a020]" : "ring-[#f0c070] hover:bg-white"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}
      <div className="flex justify-end mb-6 min-h-8">
        {canWrite && (
          <Button
            className="bg-primary text-white hover:bg-primary/90 text-[13px] h-8 px-3"
            onClick={() => openForm(null)}
          >
            <PenLineIcon className="size-3.5 mr-1.5" />
            글쓰기
          </Button>
        )}
      </div>

      <BoothPromoMap
        boothsByPosition={boothsByPosition}
        likedIds={userLikes}
        onSelect={(row, col) => setSelected({ row, col })}
      />

      <BoothDetailModal
        booth={selectedBooth ?? null}
        open={!!selectedBooth}
        onOpenChange={(open) => { if (!open) setSelected(null); }}
        size="compact"
        positionLabel={selected ? `${selected.row}-${selected.col}` : undefined}
        like={{
          liked: !!selectedBooth && userLikes.has(selectedBooth.id),
          isLoggedIn: !!user,
          onToggle: toggleLike,
        }}
        actions={
          <>
            {selectedBooth?.infoUrl ? (
              <a
                href={selectedBooth.infoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${ACTION_BUTTON} bg-[#33aa8e] text-white hover:bg-[#2d9a7f] transition-colors`}
              >
                부스인포
              </a>
            ) : (
              <button type="button" disabled className={`${ACTION_BUTTON} bg-[#999999] text-white cursor-not-allowed`}>
                부스인포
              </button>
            )}
            {canEdit && (
              <button
                type="button"
                onClick={() => openForm(selectedBooth ?? null)}
                className={`${ACTION_BUTTON} bg-white text-[#1a1a1a] ring-1 ring-[#e0e0e0] hover:bg-[#f5f5f5] cursor-pointer transition-colors`}
              >
                수정
              </button>
            )}
          </>
        }
      />

      {/* 미등록 칸 */}
      <Dialog open={!!selected && !selectedBooth} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent
          showCloseButton={false}
          className="w-auto bg-transparent ring-0 p-0 flex flex-col items-center gap-3"
        >
          <img src="/img/booth/booth-unregistered.png" alt="" className="w-[280px] h-auto" />
          <DialogTitle className="text-[24px] font-bold text-[#333333] tracking-[-0.02em]">
            부스 인포 미등록
          </DialogTitle>
        </DialogContent>
      </Dialog>

      <BoothPromoFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        booth={editing}
        occupied={occupied}
        onSaved={() => router.refresh()}
        isAdmin={role === "admin"}
        preview={previewRole !== null}
      />
    </div>
  );
}
