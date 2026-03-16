"use client";

import { useState } from "react";
import Link from "next/link";
import { getEventPosts, formatDate } from "@/lib/mock-board-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

const ITEMS_PER_PAGE = 10;

export default function EventsPage() {
  const allPosts = getEventPosts();
  const pinnedPost = allPosts.find((p) => p.isPinned);
  const regularPosts = allPosts.filter((p) => !p.isPinned);
  const totalPages = Math.max(1, Math.ceil(regularPosts.length / ITEMS_PER_PAGE));

  const [currentPage, setCurrentPage] = useState(1);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPosts = regularPosts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-8 py-10">
      {/* Header */}
      <h1 className="text-2xl font-bold text-[#212121] md:text-3xl">
        학내 행사 안내
      </h1>
      <Separator className="mt-4 mb-0 bg-[#212121]" />

      {/* Table Header - Desktop */}
      <div className="hidden md:grid md:grid-cols-[60px_1fr_100px_120px] items-center py-3 text-sm font-semibold text-[#505050] border-b border-[#e5e5e5]">
        <span className="text-center">번호</span>
        <span className="pl-4">제목</span>
        <span className="text-center">글쓴이</span>
        <span className="text-center">작성시간</span>
      </div>

      {/* Pinned Post */}
      {pinnedPost && (
        <Link
          href={`/info/events/${pinnedPost.id}`}
          className="grid grid-cols-1 md:grid-cols-[60px_1fr_100px_120px] items-center py-3.5 border-b border-[#e5e5e5] bg-[#f9fdfb] hover:bg-[#f0f9f6] transition-colors"
        >
          <span className="hidden md:flex justify-center">
            <span className="text-lg" role="img" aria-label="공지">📢</span>
          </span>
          <span className="flex items-center gap-2 pl-4 pr-4 md:pr-0">
            <span className="md:hidden text-lg" role="img" aria-label="공지">📢</span>
            <Badge className="shrink-0 bg-[#34aa8f] text-white text-[11px] px-1.5 py-0 hover:bg-[#34aa8f]">
              공지
            </Badge>
            <span className="text-[#212121] font-medium truncate text-sm md:text-base">
              {pinnedPost.title}
            </span>
          </span>
          <span className="hidden md:block text-center text-sm text-[#505050]">
            {pinnedPost.authorDisplayName}
          </span>
          <span className="hidden md:block text-center text-sm text-[#909090]">
            {formatDate(pinnedPost.createdAt)}
          </span>
          {/* Mobile meta */}
          <span className="flex md:hidden items-center gap-2 pl-4 mt-1 text-xs text-[#909090]">
            <span>{pinnedPost.authorDisplayName}</span>
            <span>·</span>
            <span>{formatDate(pinnedPost.createdAt)}</span>
          </span>
        </Link>
      )}

      {/* Regular Posts */}
      {paginatedPosts.map((post, idx) => {
        const displayNumber = regularPosts.length - startIndex - idx;
        return (
          <Link
            key={post.id}
            href={`/info/events/${post.id}`}
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
            </span>
            <span className="hidden md:block text-center text-sm text-[#505050]">
              {post.authorDisplayName}
            </span>
            <span className="hidden md:block text-center text-sm text-[#909090]">
              {formatDate(post.createdAt)}
            </span>
            {/* Mobile meta */}
            <span className="flex md:hidden items-center gap-2 pl-4 mt-1 text-xs text-[#909090]">
              <span>{post.authorDisplayName}</span>
              <span>·</span>
              <span>{formatDate(post.createdAt)}</span>
            </span>
          </Link>
        );
      })}

      {/* Empty state */}
      {regularPosts.length === 0 && !pinnedPost && (
        <div className="flex items-center justify-center py-20 text-[#909090] text-sm">
          등록된 행사 안내가 없습니다.
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

      {/* Admin-only write button (hidden) */}
      {/* <div className="flex justify-end mt-6">
        <Button className="bg-[#34aa8f] text-white hover:bg-[#2d9a7f]">
          글쓰기
        </Button>
      </div> */}
    </div>
  );
}
