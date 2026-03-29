"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Trash2Icon, FileTextIcon, ExternalLinkIcon, PenLineIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Post {
  id: string;
  title: string;
  board_type: string;
  created_at: string;
  author_display_name: string;
}

const BOARD_TYPES = [
  { value: "notice", label: "공지사항", path: "notices" },
  { value: "event", label: "학사 안내", path: "events" },
] as const;

type BoardType = (typeof BOARD_TYPES)[number]["value"];

function PostList({ boardType, refreshKey }: { boardType: BoardType; refreshKey: number }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function fetchPosts() {
    setLoading(true);
    try {
      const res = await fetch(`/api/boards?type=${boardType}&limit=50`);
      const data = await res.json();
      setPosts(data.posts ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardType, refreshKey]);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`"${title}" 게시글을 삭제하시겠습니까?`)) return;
    setDeletingId(id);
    setError("");
    try {
      const res = await fetch(`/api/boards/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchPosts();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "삭제에 실패했습니다.");
      }
    } catch {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return <div className="py-10 text-center text-sm text-[#909090]">불러오는 중...</div>;
  }

  if (posts.length === 0) {
    return <div className="py-10 text-center text-sm text-[#909090]">등록된 게시글이 없습니다.</div>;
  }

  const pathSegment = BOARD_TYPES.find((b) => b.value === boardType)?.path ?? "notices";

  return (
    <div className="space-y-1">
      {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
      <div className="divide-y divide-[#e5e5e5]">
        {posts.map((post) => (
          <div key={post.id} className="flex items-center justify-between py-3 gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <FileTextIcon className="size-4 text-[#909090] shrink-0" />
              <span className="text-sm text-[#212121] truncate">{post.title}</span>
              <span className="text-xs text-[#909090] shrink-0">{formatDate(post.created_at)}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Link
                href={`/info/write?type=${boardType}&edit=${post.id}`}
                title="수정"
                className="flex items-center justify-center size-8 rounded-md hover:bg-[#f0f0f0] transition-colors"
              >
                <PenLineIcon className="size-4 text-[#34aa8f]" />
              </Link>
              <a
                href={`/info/${pathSegment}/${post.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center size-8 rounded-md hover:bg-[#f0f0f0] transition-colors"
                title="새 탭에서 보기"
              >
                <ExternalLinkIcon className="size-4 text-[#888]" />
              </a>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-400 hover:text-red-600 hover:bg-red-50 size-8"
                disabled={deletingId === post.id}
                onClick={() => handleDelete(post.id, post.title)}
              >
                <Trash2Icon className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BoardManager() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="notice">
        <div className="flex items-center justify-between">
          <TabsList>
            {BOARD_TYPES.map((bt) => (
              <TabsTrigger key={bt.value} value={bt.value}>{bt.label}</TabsTrigger>
            ))}
          </TabsList>
        </div>

        {BOARD_TYPES.map((bt) => (
          <TabsContent key={bt.value} value={bt.value} className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#888]">{bt.label} 게시글 목록</p>
              <Button
                size="sm"
                className="bg-primary text-white hover:bg-primary/90"
                nativeButton={false}
                render={
                  <Link href={`/info/write?type=${bt.value}`}>
                    <PenLineIcon className="size-3.5 mr-1.5" />
                    글쓰기
                  </Link>
                }
              />
            </div>
            <PostList
              key={`${bt.value}-${refreshKey}`}
              boardType={bt.value}
              refreshKey={refreshKey}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
