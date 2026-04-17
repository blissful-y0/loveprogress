"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { sanitizePostContent } from "@/lib/sanitize-content";
import { wrapImagesWithLinks } from "@/lib/wrap-images-with-links";
import CommentSection from "@/components/board/comment-section";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/hooks/useUser";
import { formatDate } from "@/lib/format-date";
import type { BoardCommentRow, BoardPostRow } from "@/types/database";

const HTML_MARKER = "<!--LOVEPROGRESS:HTML-->";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ListIcon,
  PenLineIcon,
  Trash2Icon,
} from "lucide-react";

interface PostDetailResponse {
  post: BoardPostRow;
  comments: BoardCommentRow[];
  prevPost: { id: string; title: string } | null;
  nextPost: { id: string; title: string } | null;
}

export default function BoothBoardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const [id, setId] = useState<string | null>(null);
  const [data, setData] = useState<PostDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canAccess =
    !userLoading &&
    user &&
    (user.role === "booth_member" || user.role === "admin");

  // Resolve params
  useEffect(() => {
    params.then(({ id: postId }) => setId(postId));
  }, [params]);

  const fetchPost = useCallback(
    async (postId: string) => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/booth-board/${postId}`);
        const json = await res.json();

        if (!res.ok) {
          setError(json.error ?? "게시글을 불러오지 못했습니다.");
          return;
        }

        setData(json);
      } catch {
        setError("게시글을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (canAccess && id) {
      fetchPost(id);
    } else if (!userLoading && id) {
      setLoading(false);
    }
  }, [canAccess, id, fetchPost, userLoading]);

  const handleDelete = useCallback(async () => {
    if (!id || deleting) return;
    if (!confirm("게시글을 삭제하시겠습니까?")) return;

    setDeleting(true);

    try {
      const res = await fetch(`/api/booth-board/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "게시글 삭제에 실패했습니다.");
        return;
      }

      router.push("/booth-board");
    } catch {
      setError("게시글 삭제에 실패했습니다.");
    } finally {
      setDeleting(false);
    }
  }, [id, deleting, router]);

  // Access denied
  if (!userLoading && !canAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-2xl font-bold text-[#212121]">접근 제한</h1>
        <p className="text-[#909090]">부스어 인증이 필요합니다.</p>
      </div>
    );
  }

  // Loading
  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[#909090] text-sm">로딩 중...</p>
      </div>
    );
  }

  // Error or not found
  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-2xl font-bold text-[#212121]">오류</h1>
        <p className="text-[#909090]">{error ?? "게시글을 찾을 수 없습니다."}</p>
        <Link href="/booth-board">
          <Button
            variant="outline"
            className="border-[#e5e5e5] text-[#505050]"
          >
            목록으로
          </Button>
        </Link>
      </div>
    );
  }

  const { post, comments, prevPost, nextPost } = data;
  const isAuthorOrAdmin =
    user &&
    (user.authUser.id === post.author_user_id || user.role === "admin");

  return (
    <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-8 py-10">
      {/* Title area */}
      <h1 className="text-xl font-bold text-[#212121] md:text-2xl leading-tight">
        {post.title}
      </h1>
      <div className="flex items-center gap-3 mt-3 text-sm text-[#909090]">
        <span className="text-[#505050] font-medium">
          {post.author_display_name}
        </span>
        <span>·</span>
        <span>{formatDate(post.created_at)}</span>
        {post.is_secret && (
          <>
            <span>·</span>
            <span className="text-[#909090]">비밀글</span>
          </>
        )}
      </div>
      <Separator className="mt-4 mb-0 bg-[#e5e5e5]" />

      {/* Content */}
      {post.content.startsWith(HTML_MARKER) ? (
        <div
          className="prose py-8 min-h-[240px] overflow-x-auto max-w-none"
          dangerouslySetInnerHTML={{
            __html: wrapImagesWithLinks(
              sanitizePostContent(post.content.slice(HTML_MARKER.length)),
            ),
          }}
        />
      ) : (
        <div className="py-8 min-h-[240px] text-[#505050] text-sm md:text-base leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>
      )}

      <Separator className="bg-[#e5e5e5]" />

      {/* Comments */}
      <CommentSection postId={post.id} initialComments={comments} />

      <Separator className="mt-8 bg-[#e5e5e5]" />

      {/* Previous / Next navigation */}
      <div className="border-b border-[#e5e5e5]">
        {nextPost && (
          <Link
            href={`/booth-board/${nextPost.id}`}
            className="flex items-center gap-3 py-3 px-2 hover:bg-[#fafafa] transition-colors border-b border-[#f0f0f0]"
          >
            <span className="flex items-center gap-1 text-xs font-medium text-[#34aa8f] min-w-[60px]">
              <ChevronRightIcon className="size-3" />
              다음글
            </span>
            <span className="text-sm text-[#212121] truncate">
              {nextPost.title}
            </span>
          </Link>
        )}
        {prevPost && (
          <Link
            href={`/booth-board/${prevPost.id}`}
            className="flex items-center gap-3 py-3 px-2 hover:bg-[#fafafa] transition-colors"
          >
            <span className="flex items-center gap-1 text-xs font-medium text-[#909090] min-w-[60px]">
              <ChevronLeftIcon className="size-3" />
              이전글
            </span>
            <span className="text-sm text-[#212121] truncate">
              {prevPost.title}
            </span>
          </Link>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-3 mt-8">
        <Link href="/booth-board">
          <Button
            variant="outline"
            className="border-[#e5e5e5] text-[#505050] hover:bg-[#fafafa]"
          >
            <ListIcon className="size-4 mr-1.5" />
            목록으로
          </Button>
        </Link>
        <Link href="/booth-board/write">
          <Button className="bg-[#34aa8f] text-white hover:bg-[#2d9a7f]">
            <PenLineIcon className="size-4 mr-1.5" />
            글쓰기
          </Button>
        </Link>
        {isAuthorOrAdmin && (
          <>
            <Link href={`/booth-board/${post.id}/edit`}>
              <Button
                variant="outline"
                className="border-[#e5e5e5] text-[#505050] hover:bg-[#fafafa]"
              >
                수정
              </Button>
            </Link>
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={handleDelete}
            >
              <Trash2Icon className="size-4 mr-1.5" />
              {deleting ? "삭제 중..." : "삭제"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
