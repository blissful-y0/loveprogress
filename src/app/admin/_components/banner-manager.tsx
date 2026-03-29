"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { BannerGroup, MainBannerRow } from "@/types/database";

const BANNER_GROUP_LABELS: Record<BannerGroup, string> = {
  top_carousel: "상단 캐러셀",
  middle_carousel: "중간 캐러셀",
  fixed_banner: "고정 배너",
};

interface BannerFormData {
  readonly group_type: BannerGroup;
  readonly image_key: string;
  readonly bg_color: string;
  readonly link_url: string;
  readonly sort_order: number;
  readonly is_active: boolean;
}

const INITIAL_FORM: BannerFormData = {
  group_type: "top_carousel",
  image_key: "",
  bg_color: "",
  link_url: "",
  sort_order: 0,
  is_active: true,
};

export default function BannerManager() {
  const [banners, setBanners] = useState<MainBannerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState<BannerFormData>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/banners");
      if (!res.ok) throw new Error("배너 목록 로드 실패");
      const json = await res.json();
      setBanners(json.data ?? []);
    } catch {
      setError("배너 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        group_type: form.group_type,
        image_key: form.image_key,
        bg_color: form.bg_color || null,
        link_url: form.link_url || null,
        sort_order: form.sort_order,
        is_active: form.is_active,
      };

      const url = editingId
        ? `/api/admin/banners/${editingId}`
        : "/api/admin/banners";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "저장에 실패했습니다.");
      }

      setForm(INITIAL_FORM);
      setEditingId(null);
      setDialogOpen(false);
      await fetchBanners();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (banner: MainBannerRow) => {
    setEditingId(banner.id);
    setForm({
      group_type: banner.group_type,
      image_key: banner.image_key,
      bg_color: banner.bg_color ?? "",
      link_url: banner.link_url ?? "",
      sort_order: banner.sort_order,
      is_active: banner.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("삭제 실패");
      await fetchBanners();
    } catch {
      setError("배너 삭제에 실패했습니다.");
    }
  };

  const handleToggleActive = async (banner: MainBannerRow) => {
    try {
      const res = await fetch(`/api/admin/banners/${banner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !banner.is_active }),
      });
      if (!res.ok) throw new Error("변경 실패");
      await fetchBanners();
    } catch {
      setError("배너 상태 변경에 실패했습니다.");
    }
  };

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setDialogOpen(false);
    // Use setTimeout to ensure dialog state resets before opening
    setTimeout(() => setDialogOpen(true), 0);
  };

  const grouped = banners.reduce<Record<BannerGroup, MainBannerRow[]>>(
    (acc, banner) => ({
      ...acc,
      [banner.group_type]: [...(acc[banner.group_type] ?? []), banner],
    }),
    { top_carousel: [], middle_carousel: [], fixed_banner: [] },
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-text-muted">
        불러오는 중...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={<Button size="sm" />}
            onClick={openCreateDialog}
          >
            배너 추가
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "배너 수정" : "새 배너 추가"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-2">
              <div className="flex flex-col gap-1.5">
                <Label>그룹 타입</Label>
                <Select
                  value={form.group_type}
                  onValueChange={(v) =>
                    setForm({ ...form, group_type: v as BannerGroup })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top_carousel">상단 캐러셀</SelectItem>
                    <SelectItem value="middle_carousel">
                      중간 캐러셀
                    </SelectItem>
                    <SelectItem value="fixed_banner">고정 배너</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>이미지 URL</Label>
                <Input
                  value={form.image_key}
                  onChange={(e) =>
                    setForm({ ...form, image_key: e.target.value })
                  }
                  placeholder="/img/banners/example.png"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>배경색</Label>
                <div className="flex gap-2">
                  <Input
                    value={form.bg_color}
                    onChange={(e) =>
                      setForm({ ...form, bg_color: e.target.value })
                    }
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                  <input
                    type="color"
                    value={form.bg_color || "#ffffff"}
                    onChange={(e) =>
                      setForm({ ...form, bg_color: e.target.value })
                    }
                    className="h-9 w-12 cursor-pointer rounded border border-input"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>링크 URL</Label>
                <Input
                  value={form.link_url}
                  onChange={(e) =>
                    setForm({ ...form, link_url: e.target.value })
                  }
                  placeholder="https://example.com"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>정렬 순서</Label>
                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      sort_order: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  min={0}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="banner-active"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm({ ...form, is_active: e.target.checked })
                  }
                  className="size-4"
                />
                <Label htmlFor="banner-active">활성화</Label>
              </div>

              <Button onClick={handleSave} disabled={saving} className="mt-2">
                {saving ? "저장 중..." : "적용하기"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {(
        Object.entries(grouped) as [BannerGroup, MainBannerRow[]][]
      ).map(([groupType, items]) => (
        <div key={groupType} className="space-y-2">
          <h3 className="text-sm font-semibold text-text-sub">
            {BANNER_GROUP_LABELS[groupType]}
            <Badge variant="secondary" className="ml-2">
              {items.length}
            </Badge>
          </h3>

          {items.length === 0 ? (
            <p className="py-4 text-center text-sm text-text-muted">
              등록된 배너가 없습니다.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">미리보기</TableHead>
                  <TableHead>이미지</TableHead>
                  <TableHead className="w-20">배경색</TableHead>
                  <TableHead>링크</TableHead>
                  <TableHead className="w-16">순서</TableHead>
                  <TableHead className="w-16">상태</TableHead>
                  <TableHead className="w-32">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      <img
                        src={banner.image_key}
                        alt="배너"
                        className="h-10 w-16 rounded object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='40'%3E%3Crect fill='%23eee' width='64' height='40'/%3E%3C/svg%3E";
                        }}
                      />
                    </TableCell>
                    <TableCell className="max-w-32 truncate text-xs">
                      {banner.image_key}
                    </TableCell>
                    <TableCell>
                      {banner.bg_color ? (
                        <div className="flex items-center gap-1">
                          <span
                            className="inline-block size-4 rounded border"
                            style={{ backgroundColor: banner.bg_color }}
                          />
                          <span className="text-xs">{banner.bg_color}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-text-muted">-</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-32 truncate text-xs">
                      {banner.link_url || "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {banner.sort_order}
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(banner)}
                        className="cursor-pointer"
                      >
                        <Badge
                          variant={banner.is_active ? "default" : "secondary"}
                        >
                          {banner.is_active ? "활성" : "비활성"}
                        </Badge>
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(banner)}
                        >
                          수정
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(banner.id)}
                        >
                          삭제
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      ))}
    </div>
  );
}
