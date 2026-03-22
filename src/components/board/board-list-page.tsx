"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDate, isNewPost } from "@/lib/utils";
import type { BoardPostRow } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronLeftIcon, ChevronRightIcon, PenLineIcon } from "lucide-react";

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
    <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#212121] md:text-3xl">
          {title}
        </h1>
        {isAdmin && (
          <Button
            className="bg-[#34aa8f] text-white hover:bg-[#2d9a7f]"
            nativeButton={false}
            render={
              <Link href={`/info/write?type=${boardType}`}>
                <PenLineIcon className="size-4 mr-1.5" />
                글쓰기
              </Link>
            }
          />
        )}
      </div>
      <Separator className="mt-4 mb-0 bg-[#212121]" />

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
          href={`${basePath}/${pinnedPost.id}`}
          className="grid grid-cols-1 md:grid-cols-[60px_1fr_100px_120px] items-center py-3.5 border-b border-[#e5e5e5] bg-[#f9fdfb] hover:bg-[#f0f9f6] transition-colors"
        >
          <span className="hidden md:flex justify-center">
            <span className="text-lg" role="img" aria-label="공지">
              📢
            </span>
          </span>
          <span className="flex items-center gap-2 pl-4 pr-4 md:pr-0">
            <span className="md:hidden text-lg" role="img" aria-label="공지">
              📢
            </span>
            <Badge className="shrink-0 bg-[#34aa8f] text-white text-[11px] px-1.5 py-0 hover:bg-[#34aa8f]">
              공지
            </Badge>
            <span className="text-[#212121] font-medium truncate text-sm md:text-base">
              {pinnedPost.title}
            </span>
            {isNewPost(pinnedPost.created_at) && (
              <Badge className="shrink-0 bg-red-500 text-white text-[10px] px-1 py-0 hover:bg-red-500">
                N
              </Badge>
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
        const displayNumber = regularStartIndex - idx;
        return (
          <Link
            key={post.id}
            href={`${basePath}/${post.id}`}
            className="grid grid-cols-1 md:grid-cols-[60px_1fr_100px_120px] items-center py-3.5 border-b border-[#e5e5e5] hover:bg-[#fafafa] transition-colors"
          >
            <span className="hidden md:block text-center text-sm text-[#909090]">
              {displayNumber}
            </span>
            <span className="flex items-center gap-2 pl-4 pr-4 md:pr-0">
              <span className="md:hidden text-xs text-[#909090] min-w-[24px]">
                {displayNumber}
              </span>
              <span className="text-[#212121] truncate text-sm md:text-base">
                {post.title}
              </span>
              {isNewPost(post.created_at) && (
                <Badge className="shrink-0 bg-red-500 text-white text-[10px] px-1 py-0 hover:bg-red-500">
                  N
                </Badge>
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
      {regularPosts.length === 0 && pinnedPosts.length === 0 && (
        <div className="flex items-center justify-center py-20 text-[#909090] text-sm">
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

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <Button
                key={pageNum}
                variant={pageNum === page ? "default" : "ghost"}
                size="icon"
                onClick={() => goToPage(pageNum)}
                className={
                  pageNum === page
                    ? "bg-[#34aa8f] text-white hover:bg-[#2d9a7f]"
                    : "text-[#505050]"
                }
              >
                {pageNum}
              </Button>
            ),
          )}

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
