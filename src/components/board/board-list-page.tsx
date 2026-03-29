"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDate, isNewPost } from "@/lib/utils";
import type { BoardPostRow } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon, PenLineIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";

interface BoardListPageProps {
  title: string;
  basePath: string;
  emptyMessage: string;
  pinnedPosts: BoardPostRow[];
  regularPosts: BoardPostRow[];
  totalRegular: number;
  page: number;
  totalPages: number;
  itemsPerPage: number;
  isAdmin: boolean;
  pageHeader?: { label: string; title: string; subtitle: string };
}

export default function BoardListPage({
  title,
  basePath,
  emptyMessage,
  pinnedPosts,
  regularPosts,
  totalRegular,
  page,
  totalPages,
  itemsPerPage,
  isAdmin,
  pageHeader,
}: BoardListPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const boardType = basePath === "/info/notices" ? "notice" : "event";

  function goToPage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(newPage));
    }
    const qs = params.toString();
    router.push(`${basePath}${qs ? `?${qs}` : ""}`);
  }

  const regularStartIndex = totalRegular - (page - 1) * itemsPerPage;

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      {/* Decorator header */}
      {pageHeader ? (
        <div className="mb-6">
          <PageHeader {...pageHeader} />
        </div>
      ) : (
        /* Fallback: original header when no decorator */
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-[#212121] md:text-3xl">{title}</h1>
          <div className="mt-4 h-px bg-[#212121]" />
        </div>
      )}

      {/* Admin write button */}
      {isAdmin && (
        <div className="flex justify-end mb-3">
          <Button
            className="bg-primary text-white hover:bg-primary/90 text-[13px] h-8 px-3"
            nativeButton={false}
            render={
              <Link href={`/info/write?type=${boardType}`}>
                <PenLineIcon className="size-3.5 mr-1.5" />
                글쓰기
              </Link>
            }
          />
        </div>
      )}

      {/* Table Header - Desktop */}
      <div className="hidden md:grid md:grid-cols-[60px_1fr_100px_120px] items-center py-3 text-[12px] font-bold text-[#505050] tracking-wide border-y border-[#E0E0E0] bg-[#F0F0F0]">
        <span className="text-center">번호</span>
        <span className="pl-4">제목</span>
        <span className="text-center">글쓴이</span>
        <span className="text-center">작성일</span>
      </div>

      {/* Mobile table label */}
      <div className="md:hidden border-t border-[#E0E0E0]" />

      {/* Pinned Posts */}
      {pinnedPosts.map((pinnedPost) => (
        <Link
          key={pinnedPost.id}
          href={`${basePath}/${pinnedPost.id}`}
          className="flex items-center gap-2 px-4 md:px-0 md:grid md:grid-cols-[60px_1fr_100px_120px] py-3.5 border-b border-[#e5e5e5] bg-[#f9fdfb] hover:bg-[#f0f9f6] transition-colors"
        >
          <span className="hidden md:flex justify-center">
            <span className="text-base" role="img" aria-label="공지">📢</span>
          </span>
          <span className="flex-1 min-w-0 flex items-center gap-2 md:pl-4">
            <span className="md:hidden text-base shrink-0" role="img" aria-label="공지">📢</span>
            <Badge className="shrink-0 bg-primary text-white text-[11px] px-1.5 py-0 hover:bg-primary">
              공지
            </Badge>
            <span className="text-[#212121] font-medium truncate text-sm md:text-[15px]">
              {pinnedPost.title}
            </span>
            {isNewPost(pinnedPost.created_at) && (
              <Badge className="shrink-0 bg-red-500 text-white text-[10px] px-1 py-0 hover:bg-red-500">N</Badge>
            )}
          </span>
          <span className="shrink-0 whitespace-nowrap text-[11px] text-[#aaa] md:hidden">
            {pinnedPost.author_display_name} · {formatDate(pinnedPost.created_at)}
          </span>
          <span className="hidden md:block text-center text-sm text-[#505050]">
            {pinnedPost.author_display_name}
          </span>
          <span className="hidden md:block text-center text-sm text-[#909090]">
            {formatDate(pinnedPost.created_at)}
          </span>
        </Link>
      ))}

      {/* Regular Posts */}
      {regularPosts.map((post, idx) => {
        const displayNumber = regularStartIndex - idx;
        return (
          <Link
            key={post.id}
            href={`${basePath}/${post.id}`}
            className="flex items-center gap-2 px-4 md:px-0 md:grid md:grid-cols-[60px_1fr_100px_120px] py-3.5 border-b border-[#e5e5e5] hover:bg-[#f9fdfb] transition-colors"
          >
            <span className="shrink-0 w-5 text-right text-[11px] text-[#ccc] md:w-auto md:text-center md:text-sm md:text-[#aaa]">
              {displayNumber}
            </span>
            <span className="flex-1 min-w-0 flex items-center gap-1.5 md:pl-4">
              <span className="text-[#212121] truncate text-sm md:text-[15px]">
                {post.title}
              </span>
              {isNewPost(post.created_at) && (
                <Badge className="shrink-0 bg-red-500 text-white text-[10px] px-1 py-0 hover:bg-red-500">N</Badge>
              )}
            </span>
            <span className="shrink-0 whitespace-nowrap text-[11px] text-[#aaa] md:hidden">
              {post.author_display_name} · {formatDate(post.created_at)}
            </span>
            <span className="hidden md:block text-center text-sm text-[#505050]">
              {post.author_display_name}
            </span>
            <span className="hidden md:block text-center text-sm text-[#909090]">
              {formatDate(post.created_at)}
            </span>
          </Link>
        );
      })}

      {/* Empty state */}
      {regularPosts.length === 0 && pinnedPosts.length === 0 && (
        <div className="flex min-h-[240px] items-center justify-center text-[#bbb] text-sm">
          {emptyMessage}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-8">
          <Button
            variant="ghost"
            size="icon"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
            className="text-[#505050]"
          >
            <ChevronLeftIcon className="size-4" />
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <Button
              key={pageNum}
              variant={pageNum === page ? "default" : "ghost"}
              size="icon"
              onClick={() => goToPage(pageNum)}
              className={
                pageNum === page
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "text-[#505050]"
              }
            >
              {pageNum}
            </Button>
          ))}

          <Button
            variant="ghost"
            size="icon"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
            className="text-[#505050]"
          >
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
