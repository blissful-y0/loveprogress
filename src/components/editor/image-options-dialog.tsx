"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
} from "lucide-react";

export type ImageAlign = "left" | "center" | "right";

export interface ImageOptionsValue {
  src: string;
  align: ImageAlign;
  href: string | null;
}

interface ImageOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue: ImageOptionsValue | null;
  mode: "insert" | "edit";
  onSubmit: (value: ImageOptionsValue) => void;
}

const ALIGN_OPTIONS: Array<{ value: ImageAlign; label: string; icon: typeof AlignLeftIcon }> = [
  { value: "left", label: "왼쪽", icon: AlignLeftIcon },
  { value: "center", label: "가운데", icon: AlignCenterIcon },
  { value: "right", label: "오른쪽", icon: AlignRightIcon },
];

export default function ImageOptionsDialog({
  open,
  onOpenChange,
  initialValue,
  mode,
  onSubmit,
}: ImageOptionsDialogProps) {
  const [align, setAlign] = useState<ImageAlign>("center");
  const [href, setHref] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && initialValue) {
      setAlign(initialValue.align);
      setHref(initialValue.href ?? "");
      setError("");
    }
  }, [open, initialValue]);

  if (!initialValue) return null;

  const handleSubmit = () => {
    setError("");
    const trimmedHref = href.trim();
    let validatedHref: string | null = null;
    if (trimmedHref) {
      try {
        const parsed = new URL(trimmedHref);
        if (!["http:", "https:"].includes(parsed.protocol)) {
          setError("http 또는 https URL만 입력 가능합니다.");
          return;
        }
        validatedHref = trimmedHref;
      } catch {
        setError("올바른 URL을 입력해주세요.");
        return;
      }
    }
    onSubmit({ src: initialValue.src, align, href: validatedHref });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "insert" ? "이미지 삽입" : "이미지 편집"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-md border border-[#e5e5e5] bg-[#fafafa] p-2 flex items-center justify-center max-h-[220px] overflow-hidden">
            <img
              src={initialValue.src}
              alt=""
              className="max-w-full max-h-[200px] object-contain"
            />
          </div>

          <div className="space-y-1.5">
            <Label>정렬</Label>
            <div className="grid grid-cols-3 gap-1.5">
              {ALIGN_OPTIONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAlign(value)}
                  className={`flex items-center justify-center gap-1.5 rounded-md border px-2 py-2 text-[13px] transition-colors cursor-pointer ${
                    align === value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-[#e5e5e5] text-[#666] hover:bg-[#f5f5f5]"
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="image-link-url">
              링크 URL <span className="text-[#aaa] font-normal">(선택)</span>
            </Label>
            <Input
              id="image-link-url"
              type="url"
              placeholder="https://..."
              value={href}
              onChange={(e) => setHref(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <p className="text-[11px] text-[#888]">
              입력하면 이미지 클릭 시 해당 주소로 새 탭에서 이동합니다.
            </p>
          </div>

          {error && (
            <p className="text-[12px] text-red-600">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            취소
          </Button>
          <Button type="button" onClick={handleSubmit}>
            {mode === "insert" ? "삽입" : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
