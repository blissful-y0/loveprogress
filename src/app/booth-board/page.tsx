"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/hooks/useUser";
import { formatDate } from "@/lib/format-date";
import type { BoardPostRow } from "@/types/database";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  LockIcon,
  PenLineIcon,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";

const ITEMS_PER_PAGE = 10;

type PostWithCommentCount = BoardPostRow & { comment_count?: number };

interface PostsResponse {
  posts: PostWithCommentCount[];
  total: number;
  pinnedCount: number;
  page: number;
  limit: number;
}

export default function BoothBoardPage() {
  const { user, loading: userLoading } = useUser();
  const [posts, setPosts] = useState<PostWithCommentCount[]>([]);
  const [total, setTotal] = useState(0);
  const [pinnedCount, setPinnedCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canAccess =
    !userLoading &&
    user &&
    (user.role === "booth_member" || user.role === "admin");

  const fetchPosts = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/booth-board?page=${page}&limit=${ITEMS_PER_PAGE}`,
      );
      const data: PostsResponse = await res.json();

      if (!res.ok) {
        setError((data as unknown as { error: string }).error ?? "게시글을 불러오지 못했습니다.");
        return;
      }

      setPosts(data.posts);
      setTotal(data.total);
      setPinnedCount(data.pinnedCount);
    } catch {
      setError("게시글을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canAccess) {
      fetchPosts(currentPage);
    } else if (!userLoading) {
      setLoading(false);
    }
  }, [canAccess, currentPage, fetchPosts, userLoading]);

  // Access denied
  if (!userLoading && !canAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-2xl font-bold text-[#212121]">부스어 전용 게시판</h1>
        <p className="text-[#909090]">목마른 사람이 물가에 왔지만, 수면에 비친 달빛에 녹아버렸다.</p>
        {!user && (
          <Link href="/auth/login">
            <Button className="bg-[#34aa8f] text-white hover:bg-[#2d9a7f]">
              로그인
            </Button>
          </Link>
        )}
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

  const pinnedPosts = posts.filter((p) => p.is_pinned);
  const regularPosts = posts.filter((p) => !p.is_pinned);
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  // Calculate display numbers for regular posts using server-side pinned count
  const regularTotal = total - pinnedCount;
  const startNumber = regularTotal - (currentPage - 1) * ITEMS_PER_PAGE;

  return (
    <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-6">
        <PageHeader
          label="깨달음의 나무 정원"
          title="부스어 전용 게시판"
          subtitle="부스 참가자 전용 게시판입니다."
        />
      </div>
      <div className="flex justify-end mb-3">
        <Link href="/booth-board/write">
          <Button className="bg-primary text-white hover:bg-primary/90 text-[13px] h-8 px-3">
            <PenLineIcon className="size-3.5 mr-1.5" />
            글쓰기
          </Button>
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="py-8 text-center text-sm text-red-500">{error}</div>
      )}

      {/* Table Header - Desktop */}
      <div className="hidden md:grid md:grid-cols-[60px_1fr_100px_120px] items-center py-3 text-sm font-semibold text-[#505050] border-b border-[#e5e5e5]">
        <span className="text-center">번호</span>
        <span className="pl-4">제목</span>
        <span className="text-center">글쓴이</span>
        <span className="text-center">작성시간</span>
      </div>

      {/* Pinned Posts */}
      {pinnedPosts.map((pinnedPost) => (
        <Link
          key={pinnedPost.id}
          href={`/booth-board/${pinnedPost.id}`}
          className="grid grid-cols-1 md:grid-cols-[60px_1fr_100px_120px] items-center py-3.5 border-b border-[#e5e5e5] bg-[#f9fdfb] hover:bg-[#f0f9f6] transition-colors"
        >
          <span className="hidden md:flex justify-center text-xs text-[#34aa8f] font-semibold">
            공지
          </span>
          <span className="flex items-center gap-2 pl-4 pr-4 md:pr-0">
            <span className="md:hidden text-xs text-[#34aa8f] font-semibold">
              공지
            </span>
            <Badge className="shrink-0 bg-[#34aa8f] text-white text-[11px] px-1.5 py-0 hover:bg-[#34aa8f]">
              공지
            </Badge>
            <span className="text-[#212121] font-medium truncate text-sm md:text-base">
              {pinnedPost.title}
            </span>
            {(pinnedPost.comment_count ?? 0) > 0 && (
              <span className="text-[#34aa8f] font-bold text-sm shrink-0">[{pinnedPost.comment_count}]</span>
            )}
          </span>
          <span className="hidden md:block text-center text-sm text-[#505050]">
            {pinnedPost.author_display_name}
          </span>
          <span className="hidden md:block text-center text-sm text-[#909090]">
            {formatDate(pinnedPost.created_at)}
          </span>
          {/* Mobile meta */}
          <span className="flex md:hidden items-center gap-2 pl-4 mt-1 text-xs text-[#909090]">
            <span>{pinnedPost.author_display_name}</span>
            <span>·</span>
            <span>{formatDate(pinnedPost.created_at)}</span>
          </span>
        </Link>
      ))}

      {/* Regular Posts */}
      {regularPosts.map((post, idx) => {
        const displayNumber = startNumber - idx;
        return (
          <Link
            key={post.id}
            href={`/booth-board/${post.id}`}
            className="grid grid-cols-1 md:grid-cols-[60px_1fr_100px_120px] items-center py-3.5 border-b border-[#e5e5e5] hover:bg-[#fafafa] transition-colors"
          >
            <span className="hidden md:block text-center text-sm text-[#909090]">
              {displayNumber}
            </span>
            <span className="flex items-center gap-2 pl-4 pr-4 md:pr-0">
              <span className="md:hidden text-xs text-[#909090] min-w-[24px]">
                {displayNumber}
              </span>
              {post.is_secret && (
                <LockIcon className="size-3.5 shrink-0 text-[#909090]" />
              )}
              <span className="text-[#212121] truncate text-sm md:text-base">
                {post.title}
              </span>
              {(post.comment_count ?? 0) > 0 && (
                <span className="text-[#34aa8f] font-bold text-sm shrink-0">[{post.comment_count}]</span>
              )}
            </span>
            <span className="hidden md:block text-center text-sm text-[#505050]">
              {post.author_display_name}
            </span>
            <span className="hidden md:block text-center text-sm text-[#909090]">
              {formatDate(post.created_at)}
            </span>
            {/* Mobile meta */}
            <span className="flex md:hidden items-center gap-2 pl-4 mt-1 text-xs text-[#909090]">
              <span>{post.author_display_name}</span>
              <span>·</span>
              <span>{formatDate(post.created_at)}</span>
            </span>
          </Link>
        );
      })}

      {/* Empty state */}
      {!error && posts.length === 0 && (
        <div className="flex items-center justify-center py-20 text-[#909090] text-sm">
          아직 게시글이 없습니다.
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-8">
          <Button
            variant="ghost"
            size="icon"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="text-[#505050]"
          >
            <ChevronLeftIcon className="size-4" />
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "ghost"}
              size="icon"
              onClick={() => setCurrentPage(page)}
              className={
                page === currentPage
                  ? "bg-[#34aa8f] text-white hover:bg-[#2d9a7f]"
                  : "text-[#505050]"
              }
            >
              {page}
            </Button>
          ))}

          <Button
            variant="ghost"
            size="icon"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="text-[#505050]"
          >
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
