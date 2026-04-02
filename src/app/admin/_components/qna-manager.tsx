"use client";

import { useCallback, useEffect, useState } from "react";
import { getCharacterByKey } from "@/app/qna/_lib/constants";

interface QnaAdminPost {
  id: string;
  writer_name: string;
  is_secret: boolean;
  is_hidden: boolean;
  image_key: string | null;
  content: string;
  created_at: string;
  answer: string | null;
  hasAnswer: boolean;
}

interface AdminQnaResponse {
  posts: QnaAdminPost[];
  total: number;
  page: number;
  totalPages: number;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function PostCard({ post, onAnswerSaved }: { post: QnaAdminPost; onAnswerSaved: () => void }) {
  const [answerText, setAnswerText] = useState(post.answer ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hiding, setHiding] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const character = getCharacterByKey(post.image_key ?? "");

  const handleSave = async () => {
    if (!answerText.trim()) {
      setStatus({ type: "error", message: "답변 내용을 입력해주세요." });
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/admin/qna/${post.id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: answerText.trim() }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) {
        setStatus({ type: "error", message: data.error ?? "저장에 실패했습니다." });
        return;
      }
      setStatus({ type: "success", message: "답변이 저장되었습니다." });
      onAnswerSaved();
    } catch {
      setStatus({ type: "error", message: "잠시 후 다시 시도해주세요." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!post.hasAnswer) return;
    if (!window.confirm("답변을 삭제하시겠습니까?")) return;
    setDeleting(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/admin/qna/${post.id}/answer`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setStatus({ type: "error", message: data.error ?? "삭제에 실패했습니다." });
        return;
      }
      setAnswerText("");
      setStatus({ type: "success", message: "답변이 삭제되었습니다." });
      onAnswerSaved();
    } catch {
      setStatus({ type: "error", message: "잠시 후 다시 시도해주세요." });
    } finally {
      setDeleting(false);
    }
  };

  const handleHide = async () => {
    setHiding(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/admin/qna/${post.id}/hide`, { method: "PATCH" });
      const data = await res.json() as { is_hidden?: boolean; error?: string };
      if (!res.ok) {
        setStatus({ type: "error", message: data.error ?? "숨김 처리에 실패했습니다." });
        return;
      }
      const newHidden = data.is_hidden ?? !post.is_hidden;
      setStatus({ type: "success", message: newHidden ? "숨김 처리되었습니다." : "숨김이 해제되었습니다." });
      onAnswerSaved();
    } catch {
      setStatus({ type: "error", message: "잠시 후 다시 시도해주세요." });
    } finally {
      setHiding(false);
    }
  };

  return (
    <div className={`border border-[#e0f0ea] rounded-[14px] overflow-hidden ${post.is_hidden ? "opacity-50" : ""}`}>
      {/* Header */}
      <div className="bg-primary px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-white">{post.writer_name}</span>
          {post.is_secret && (
            <span className="text-[11px] text-white bg-black/15 px-2 py-0.5 rounded-full font-bold">비밀글</span>
          )}
          {post.is_hidden && (
            <span className="text-[11px] text-white bg-red-500/50 px-2 py-0.5 rounded-full font-bold">숨김</span>
          )}
          {post.hasAnswer && (
            <span className="text-[11px] text-white bg-white/20 px-2 py-0.5 rounded-full font-bold">답변완료</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-white/70 text-[12px]">
          <span>{character.label}</span>
          <span>·</span>
          <span>{formatDate(post.created_at)}</span>
        </div>
      </div>

      <div className="bg-white px-4 py-4 space-y-4">
        {/* Question */}
        <div>
          <p className="text-[11px] font-bold text-primary mb-1.5">Q. 문의 내용</p>
          <div className="bg-[#f5fbf8] rounded-[10px] px-4 py-3 text-[14px] text-[#333] leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>
        </div>

        {/* Answer editor */}
        <div>
          <p className="text-[11px] font-bold text-[#888] mb-1.5">A. 답변 작성</p>
          <textarea
            value={answerText}
            onChange={(e) => { setAnswerText(e.target.value); setStatus(null); }}
            placeholder="답변을 입력하세요..."
            maxLength={5000}
            className="w-full border border-[#e0e0e0] rounded-[10px] px-4 py-3 text-[14px] text-[#333] leading-relaxed resize-none h-[100px] focus:outline-none focus:border-primary"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div>
            {status && (
              <span className={`text-[13px] ${status.type === "success" ? "text-green-600" : "text-red-500"}`}>
                {status.message}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleHide}
              disabled={hiding}
              className={`text-[13px] border rounded-[8px] px-4 py-1.5 disabled:opacity-50 transition-colors ${
                post.is_hidden
                  ? "text-blue-500 border-blue-300 hover:border-blue-500"
                  : "text-[#aaa] border-[#e0e0e0] hover:border-orange-300 hover:text-orange-500"
              }`}
            >
              {hiding ? "처리 중..." : post.is_hidden ? "숨김 해제" : "숨김"}
            </button>
            {post.hasAnswer && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="text-[13px] text-[#aaa] border border-[#e0e0e0] rounded-[8px] px-4 py-1.5 hover:border-red-300 hover:text-red-500 disabled:opacity-50 transition-colors"
              >
                {deleting ? "삭제 중..." : "답변 삭제"}
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="text-[13px] font-bold bg-primary text-white rounded-[8px] px-5 py-1.5 hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {saving ? "저장 중..." : post.hasAnswer ? "답변 수정" : "답변 등록"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QnaManager() {
  const [posts, setPosts] = useState<QnaAdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<"all" | "answered" | "unanswered" | "hidden">("unanswered");

  const fetchPosts = useCallback(async (p: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/qna?page=${p}&limit=20`);
      if (!res.ok) throw new Error();
      const data = await res.json() as AdminQnaResponse;
      setPosts(data.posts);
      setTotalPages(data.totalPages);
      setTotal(data.total);
      setPage(data.page);
    } catch {
      setError("목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(page);
  }, [page, fetchPosts]);

  const filteredPosts = posts.filter((p) => {
    if (filter === "answered") return p.hasAnswer;
    if (filter === "unanswered") return !p.hasAnswer;
    if (filter === "hidden") return p.is_hidden;
    return true;
  });

  const unansweredCount = posts.filter((p) => !p.hasAnswer).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">
          전체 {total}건 · 미답변 <span className="font-bold text-red-500">{unansweredCount}건</span>
        </p>
        <div className="flex gap-1.5">
          {(["all", "unanswered", "answered", "hidden"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`text-[13px] px-3 py-1.5 rounded-[8px] border transition-colors ${
                filter === f
                  ? "bg-primary text-white border-primary font-bold"
                  : "border-[#e0e0e0] text-[#707070] hover:border-primary hover:text-primary"
              }`}
            >
              {f === "all" ? "전체" : f === "unanswered" ? "미답변" : f === "answered" ? "답변완료" : "숨김"}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-text-muted">불러오는 중...</div>
      ) : filteredPosts.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-text-muted text-sm">
          {filter === "unanswered" ? "미답변 문의가 없습니다." : filter === "answered" ? "답변 완료된 문의가 없습니다." : filter === "hidden" ? "숨김 처리된 문의가 없습니다." : "등록된 문의가 없습니다."}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} onAnswerSaved={() => fetchPosts(page)} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="text-[13px] px-3 py-1.5 border border-[#e0e0e0] rounded-[8px] disabled:opacity-40 hover:border-primary transition-colors"
          >
            이전
          </button>
          <span className="text-[13px] text-[#888]">{page} / {totalPages}</span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="text-[13px] px-3 py-1.5 border border-[#e0e0e0] rounded-[8px] disabled:opacity-40 hover:border-primary transition-colors"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
