"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import type { BoardPostRow, BoardType } from "@/types/database";
import { createClient } from "@/lib/supabase/client";

const BOARD_TYPE_LABELS: Record<BoardType, string> = {
  notice: "공지사항",
  event: "이벤트",
  booth_private: "부스 게시판",
};

export default function PinManager() {
  const [boardType, setBoardType] = useState<BoardType>("notice");
  const [posts, setPosts] = useState<BoardPostRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchPosts = useCallback(async (type: BoardType) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("board_posts")
        .select("*")
        .eq("board_type", type)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      const postList = (data ?? []) as BoardPostRow[];
      setPosts(postList);

      const pinned = postList.find((p) => p.is_pinned);
      setSelectedPostId(pinned?.id ?? null);
    } catch {
      setError("게시글 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(boardType);
  }, [boardType, fetchPosts]);

  const handlePin = async () => {
    if (!selectedPostId) {
      setError("고정할 게시글을 선택해주세요.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/boards/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boardType,
          postId: selectedPostId,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "고정 처리에 실패했습니다.");
      }

      setSuccess("게시글이 고정되었습니다.");
      await fetchPosts(boardType);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "고정 처리에 실패했습니다.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-text-dark">공지 고정 관리</h2>

      <div className="flex items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>게시판 선택</Label>
          <Select
            value={boardType}
            onValueChange={(v) => setBoardType(v as BoardType)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="notice">공지사항</SelectItem>
              <SelectItem value="event">이벤트</SelectItem>
              <SelectItem value="booth_private">부스 게시판</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handlePin} disabled={saving || !selectedPostId}>
          {saving ? "처리 중..." : "등록하기"}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      {success && (
        <p className="text-sm text-green-600">{success}</p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12 text-text-muted">
          불러오는 중...
        </div>
      ) : posts.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-muted">
          {BOARD_TYPE_LABELS[boardType]}에 등록된 게시글이 없습니다.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">선택</TableHead>
              <TableHead>제목</TableHead>
              <TableHead className="w-24">작성자</TableHead>
              <TableHead className="w-16">상태</TableHead>
              <TableHead className="w-28">작성일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow
                key={post.id}
                className={
                  selectedPostId === post.id ? "bg-primary/5" : undefined
                }
              >
                <TableCell>
                  <input
                    type="radio"
                    name="pin-post"
                    checked={selectedPostId === post.id}
                    onChange={() => setSelectedPostId(post.id)}
                    className="size-4 cursor-pointer"
                  />
                </TableCell>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell className="text-sm text-text-sub">
                  {post.author_display_name}
                </TableCell>
                <TableCell>
                  {post.is_pinned && (
                    <Badge variant="default">고정</Badge>
                  )}
                </TableCell>
                <TableCell className="text-xs text-text-muted">
                  {new Date(post.created_at).toLocaleDateString("ko-KR")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
