"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { BoardType } from "@/types/database";

const TiptapEditor = dynamic(() => import("@/components/editor/tiptap-editor"), { ssr: false });

const HTML_MARKER = "<!--LOVEPROGRESS:HTML-->";

const BOARD_TYPE_LABELS: Record<string, string> = {
  notice: "공지사항",
  event: "행사 안내",
};

const BOARD_TYPE_PATHS: Record<string, string> = {
  notice: "/info/notices",
  event: "/info/events",
};

function WritePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useUser();

  const typeParam = searchParams.get("type") ?? "notice";
  const editId = searchParams.get("edit");

  const [boardType, setBoardType] = useState<BoardType>(
    typeParam === "event" ? "event" : "notice",
  );
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loadingPost, setLoadingPost] = useState(!!editId);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.replace("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!editId) return;

    async function fetchPost() {
      try {
        const res = await fetch(`/api/boards/${editId}`);
        if (!res.ok) {
          setError("게시글을 불러오는데 실패했습니다.");
          return;
        }
        const data = await res.json();
        setTitle(data.post.title);
        const raw = data.post.content as string;
        setContent(raw.startsWith(HTML_MARKER) ? raw.slice(HTML_MARKER.length) : raw);
        setBoardType(data.post.board_type);
      } catch {
        setError("게시글을 불러오는데 실패했습니다.");
      } finally {
        setLoadingPost(false);
      }
    }

    fetchPost();
  }, [editId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const url = editId ? `/api/boards/${editId}` : "/api/boards";
      const method = editId ? "PUT" : "POST";
      const htmlContent = HTML_MARKER + content;
      const body = editId
        ? { title, content: htmlContent }
        : { boardType, title, content: htmlContent };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "저장에 실패했습니다.");
        return;
      }

      const redirectPath = BOARD_TYPE_PATHS[boardType] ?? "/info/notices";
      router.push(redirectPath);
    } catch {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || (!user && loading)) {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-8 py-10">
        <div className="flex items-center justify-center py-20 text-[#909090] text-sm">
          로딩 중...
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  if (loadingPost) {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-8 py-10">
        <div className="flex items-center justify-center py-20 text-[#909090] text-sm">
          게시글 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-[#212121] md:text-3xl">
        {editId ? "게시글 수정" : "게시글 작성"}
      </h1>
      <Separator className="mt-4 mb-6 bg-[#212121]" />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Board type selector */}
        {!editId && (
          <div className="space-y-2">
            <Label htmlFor="boardType">게시판 선택</Label>
            <select
              id="boardType"
              value={boardType}
              onChange={(e) => setBoardType(e.target.value as BoardType)}
              className="h-8 w-full max-w-[200px] rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="notice">{BOARD_TYPE_LABELS.notice}</option>
              <option value="event">{BOARD_TYPE_LABELS.event}</option>
            </select>
          </div>
        )}

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">제목</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            maxLength={200}
            required
            className="h-10"
          />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Label>내용</Label>
          <TiptapEditor
            content={content}
            onChange={setContent}
            placeholder="내용을 입력하세요..."
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            className="border-[#e5e5e5] text-[#505050] hover:bg-[#fafafa] min-w-[100px]"
            onClick={() => router.back()}
          >
            취소
          </Button>
          <Button
            type="submit"
            disabled={submitting || !title.trim() || !content.trim()}
            className="bg-[#34aa8f] text-white hover:bg-[#2d9a7f] min-w-[100px]"
          >
            {submitting
              ? "저장 중..."
              : editId
                ? "수정"
                : "등록"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function WritePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-8 py-10">
          <div className="flex items-center justify-center py-20 text-[#909090] text-sm">
            로딩 중...
          </div>
        </div>
      }
    >
      <WritePageContent />
    </Suspense>
  );
}
