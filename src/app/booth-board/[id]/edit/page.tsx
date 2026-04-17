"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/hooks/useUser";
import type { BoardPostRow } from "@/types/database";

const TiptapEditor = dynamic(() => import("@/components/editor/tiptap-editor"), { ssr: false });

const HTML_MARKER = "<!--LOVEPROGRESS:HTML-->";

export default function BoothBoardEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const [id, setId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSecret, setIsSecret] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAccess = !userLoading && user && (user.role === "booth_member" || user.role === "admin");

  useEffect(() => { params.then(({ id: postId }) => setId(postId)); }, [params]);

  useEffect(() => {
    if (!canAccess || !id) return;

    async function fetchPost() {
      try {
        const res = await fetch(`/api/booth-board/${id}`);
        const json = await res.json();
        if (!res.ok) { setError(json.error ?? "게시글을 불러오지 못했습니다."); return; }

        const post: BoardPostRow = json.post;
        if (user && post.author_user_id !== user.authUser.id && user.role !== "admin") {
          setError("수정 권한이 없습니다.");
          return;
        }

        setTitle(post.title);
        const raw = post.content;
        setContent(raw.startsWith(HTML_MARKER) ? raw.slice(HTML_MARKER.length) : raw);
        setIsSecret(post.is_secret);
      } catch {
        setError("게시글을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [canAccess, id, user]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!id || submitting) return;
      if (!title.trim()) { setError("제목을 입력해주세요."); return; }
      if (!content.trim() || content === "<p></p>") { setError("내용을 입력해주세요."); return; }

      setSubmitting(true);
      setError(null);

      try {
        const res = await fetch(`/api/booth-board/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title.trim(), content: HTML_MARKER + content, isSecret }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? "게시글 수정에 실패했습니다."); return; }
        router.push(`/booth-board/${id}`);
      } catch {
        setError("게시글 수정에 실패했습니다.");
      } finally {
        setSubmitting(false);
      }
    },
    [id, title, content, isSecret, submitting, router],
  );

  if (userLoading || loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[#909090] text-sm">로딩 중...</p></div>;
  }

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-2xl font-bold text-[#212121]">접근 제한</h1>
        <p className="text-[#909090]">부스어 인증이 필요합니다.</p>
      </div>
    );
  }

  if (error && !title && !content) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-2xl font-bold text-[#212121]">오류</h1>
        <p className="text-[#909090]">{error}</p>
        <Button variant="outline" className="border-[#e5e5e5] text-[#505050]" onClick={() => router.push("/booth-board")}>목록으로</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-[#212121] md:text-3xl">글 수정</h1>
      <Separator className="mt-4 mb-6 bg-[#212121]" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-[#212121]">제목</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목을 입력해주세요" maxLength={200} className="h-10" />
        </div>

        <div className="space-y-2">
          <Label className="text-[#212121]">내용</Label>
          <TiptapEditor content={content} onChange={setContent} placeholder="내용을 입력하세요..." uploadEndpoint="/api/booth-board/upload" />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id="isSecret" checked={isSecret} onCheckedChange={(checked) => setIsSecret(checked === true)} />
          <Label htmlFor="isSecret" className="text-sm text-[#505050] cursor-pointer">비밀글로 설정</Label>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex items-center justify-center gap-3 pt-4">
          <Button type="button" variant="outline" className="border-[#e5e5e5] text-[#505050] hover:bg-[#fafafa]" onClick={() => router.push(`/booth-board/${id}`)}>취소</Button>
          <Button type="submit" disabled={submitting} className="bg-[#34aa8f] text-white hover:bg-[#2d9a7f] disabled:opacity-50">
            {submitting ? "수정 중..." : "수정하기"}
          </Button>
        </div>
      </form>
    </div>
  );
}
