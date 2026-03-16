import Link from "next/link";
import { formatDate, type BoardPost } from "@/lib/mock-board-data";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronLeftIcon, ChevronRightIcon, ListIcon } from "lucide-react";

interface BoardDetailPageProps {
  basePath: string;
  post: BoardPost;
  prevPost: BoardPost | null;
  nextPost: BoardPost | null;
}

export default function BoardDetailPage({
  basePath,
  post,
  prevPost,
  nextPost,
}: BoardDetailPageProps) {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-8 py-10">
      {/* Title area */}
      <h1 className="text-xl font-bold text-[#212121] md:text-2xl leading-tight">
        {post.title}
      </h1>
      <div className="flex items-center gap-3 mt-3 text-sm text-[#909090]">
        <span className="text-[#505050] font-medium">
          {post.authorDisplayName}
        </span>
        <span>·</span>
        <span>{formatDate(post.createdAt)}</span>
      </div>
      <Separator className="mt-4 mb-0 bg-[#e5e5e5]" />

      {/* Content */}
      <div className="py-8 min-h-[240px] text-[#505050] text-sm md:text-base leading-relaxed whitespace-pre-wrap">
        {post.content}
      </div>

      <Separator className="bg-[#e5e5e5]" />

      {/* Previous / Next navigation */}
      <div className="border-b border-[#e5e5e5]">
        {nextPost && (
          <Link
            href={`${basePath}/${nextPost.id}`}
            className="flex items-center gap-3 py-3 px-2 hover:bg-[#fafafa] transition-colors border-b border-[#f0f0f0]"
          >
            <span className="flex items-center gap-1 text-xs font-medium text-[#34aa8f] min-w-[60px]">
              <ChevronRightIcon className="size-3" />
              다음글
            </span>
            <span className="text-sm text-[#212121] truncate">{nextPost.title}</span>
          </Link>
        )}
        {prevPost && (
          <Link
            href={`${basePath}/${prevPost.id}`}
            className="flex items-center gap-3 py-3 px-2 hover:bg-[#fafafa] transition-colors"
          >
            <span className="flex items-center gap-1 text-xs font-medium text-[#909090] min-w-[60px]">
              <ChevronLeftIcon className="size-3" />
              이전글
            </span>
            <span className="text-sm text-[#212121] truncate">{prevPost.title}</span>
          </Link>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-3 mt-8">
        <Button
          variant="outline"
          className="border-[#e5e5e5] text-[#505050] hover:bg-[#fafafa]"
          nativeButton={false}
          render={
            <Link href={basePath}>
              <ListIcon className="size-4 mr-1.5" />
              목록으로
            </Link>
          }
        />
      </div>
    </div>
  );
}
