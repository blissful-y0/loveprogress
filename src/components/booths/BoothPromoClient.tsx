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

const ACTION_BUTTON = "flex h-[30px] w-[80px] items-center justify-center rounded-[4px] text-[16px] font-semibold";

export default function BoothPromoClient({ booths }: BoothPromoClientProps) {
  const router = useRouter();
  const { user } = useUser();
  const { userLikes, toggleLike } = useBoothLikes();

  const [selected, setSelected] = useState<{ row: BoothRowLabel; col: number } | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BoothCardData | null>(null);

  const boothsByPosition = useMemo(() => {
    const map = new Map<string, BoothCardData>();
    for (const booth of booths) {
      if (booth.rowLabel && booth.colNo) map.set(boothPositionKey(booth.rowLabel, booth.colNo), booth);
    }
    return map;
  }, [booths]);
  const occupied = useMemo(() => new Set(boothsByPosition.keys()), [boothsByPosition]);

  const canWrite = user?.role === "booth_member" || user?.role === "admin";
  const selectedBooth = selected ? boothsByPosition.get(boothPositionKey(selected.row, selected.col)) : undefined;
  const canEdit =
    !!selectedBooth && !!user && (user.role === "admin" || selectedBooth.userId === user.authUser.id);

  const openForm = (booth: BoothCardData | null) => {
    setSelected(null);
    setEditing(booth);
    setFormOpen(true);
  };

  return (
    <div className="pb-16">
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
        isAdmin={user?.role === "admin"}
      />
    </div>
  );
}
