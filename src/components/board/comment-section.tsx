"use client";

import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";
import { formatDateTime } from "@/lib/format-date";
import type { BoardCommentRow } from "@/types/database";
import { Separator } from "@/components/ui/separator";
import { Trash2Icon } from "lucide-react";

interface CommentSectionProps {
  postId: string;
  initialComments: BoardCommentRow[];
}

export default function CommentSection({
  postId,
  initialComments,
}: CommentSectionProps) {
  const { user } = useUser();
  const [comments, setComments] = useState<BoardCommentRow[]>(initialComments);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!content.trim() || submitting) return;

      setSubmitting(true);
      setError(null);

      try {
        const res = await fetch(`/api/booth-board/${postId}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: content.trim() }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "댓글 작성에 실패했습니다.");
          return;
        }

        setComments((prev) => [...prev, data.comment]);
        setContent("");
      } catch {
        setError("댓글 작성에 실패했습니다.");
      } finally {
        setSubmitting(false);
      }
    },
    [content, postId, submitting],
  );

  const handleDelete = useCallback(
    async (commentId: string) => {
      if (!confirm("댓글을 삭제하시겠습니까?")) return;

      try {
        const res = await fetch(
          `/api/booth-board/${postId}/comments/${commentId}`,
          { method: "DELETE" },
        );

        if (!res.ok) {
          const data = await res.json();
          setError(data.error ?? "댓글 삭제에 실패했습니다.");
          return;
        }

        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } catch {
        setError("댓글 삭제에 실패했습니다.");
      }
    },
    [postId],
  );

  const canDeleteComment = useCallback(
    (authorUserId: string) => {
      if (!user) return false;
      return user.authUser.id === authorUserId || user.role === "admin";
    },
    [user],
  );

  return (
    <div className="mt-8">
      <h3 className="text-base font-semibold text-[#212121]">
        댓글 {comments.length > 0 && <span className="text-[#34aa8f]">{comments.length}</span>}
      </h3>
      <Separator className="mt-2 mb-0 bg-[#e5e5e5]" />

      {/* Comments list */}
      {comments.length === 0 ? (
        <div className="py-8 text-center text-sm text-[#909090]">
          아직 댓글이 없습니다.
        </div>
      ) : (
        <ul>
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="py-4 border-b border-[#f0f0f0] last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#212121]">
                    {comment.author_display_name}
                  </span>
                  <span className="text-xs text-[#909090]">
                    {formatDateTime(comment.created_at)}
                  </span>
                </div>
                {canDeleteComment(comment.author_user_id) && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-[#909090] hover:text-red-500"
                    onClick={() => handleDelete(comment.id)}
                  >
                    <Trash2Icon className="size-3.5" />
                  </Button>
                )}
              </div>
              <p className="mt-1.5 text-sm text-[#505050] whitespace-pre-wrap">
                {comment.content}
              </p>
            </li>
          ))}
        </ul>
      )}

      {/* Comment input form */}
      {user && (
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="flex gap-2">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="댓글을 입력해주세요."
              maxLength={2000}
              rows={3}
              className="flex-1 rounded-lg border border-[#e5e5e5] bg-transparent px-3 py-2 text-sm text-[#212121] placeholder:text-[#909090] outline-none focus:border-[#34aa8f] resize-none"
            />
            <Button
              type="submit"
              disabled={submitting || !content.trim()}
              className="self-end bg-[#34aa8f] text-white hover:bg-[#2d9a7f] disabled:opacity-50"
            >
              {submitting ? "등록 중..." : "등록"}
            </Button>
          </div>
          {error && (
            <p className="mt-2 text-xs text-red-500">{error}</p>
          )}
        </form>
      )}
    </div>
  );
}
