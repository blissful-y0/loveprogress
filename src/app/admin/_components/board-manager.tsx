"use client";

import { useEffect, useRef, useState } from "react";

const HTML_MARKER = "<!--LOVEPROGRESS:HTML-->";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadIcon, Trash2Icon, FileTextIcon, ExternalLinkIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Post {
  id: string;
  title: string;
  board_type: string;
  created_at: string;
  author_display_name: string;
}

const BOARD_TYPES = [
  { value: "notice", label: "공지사항" },
  { value: "event", label: "행사 안내" },
] as const;

type BoardType = (typeof BOARD_TYPES)[number]["value"];

function PostList({
  boardType,
  onDelete,
}: {
  boardType: BoardType;
  onDelete: () => void;
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

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
  }, [boardType]);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`"${title}" 게시글을 삭제하시겠습니까?`)) return;
    setDeletingId(id);
    setDeleteError("");
    try {
      const res = await fetch(`/api/boards/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchPosts();
        onDelete();
      } else {
        const data = await res.json().catch(() => ({}));
        setDeleteError(data.error ?? "삭제에 실패했습니다.");
      }
    } catch {
      setDeleteError("서버 오류가 발생했습니다.");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="py-10 text-center text-sm text-[#909090]">불러오는 중...</div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-[#909090]">
        등록된 게시글이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {deleteError && (
        <p className="text-sm text-red-500 mb-2">{deleteError}</p>
      )}
    <div className="divide-y divide-[#e5e5e5]">
      {posts.map((post) => (
        <div key={post.id} className="flex items-center justify-between py-3 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <FileTextIcon className="size-4 text-[#909090] shrink-0" />
            <span className="text-sm text-[#212121] truncate">{post.title}</span>
            <span className="text-xs text-[#909090] shrink-0">
              {formatDate(post.created_at)}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`/info/${boardType === "notice" ? "notices" : "events"}/${post.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#34aa8f] hover:underline"
            >
              <ExternalLinkIcon className="size-4" />
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

function HtmlUploader({
  boardType,
  onUploaded,
}: {
  boardType: BoardType;
  onUploaded: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [fileName, setFileName] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    if (!title) {
      setTitle(file.name.replace(/\.html?$/i, ""));
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setHtmlContent((ev.target?.result as string) ?? "");
    };
    reader.readAsText(file, "utf-8");
  }

  async function handleUpload() {
    if (!title.trim() || !htmlContent.trim()) {
      setError("제목과 HTML 파일을 모두 입력해주세요.");
      return;
    }

    setError("");
    setUploading(true);

    try {
      const res = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boardType, title: title.trim(), content: HTML_MARKER + htmlContent }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "업로드에 실패했습니다.");
        return;
      }

      // 초기화
      setTitle("");
      setFileName("");
      setHtmlContent("");
      if (fileRef.current) fileRef.current.value = "";
      onUploaded();
    } catch {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#505050]">제목</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="게시글 제목을 입력하세요"
          maxLength={200}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-[#505050]">HTML 파일</label>
        <div
          className="flex items-center gap-3 rounded-lg border border-dashed border-[#d0d0d0] px-4 py-5 hover:border-[#34aa8f] transition-colors cursor-pointer"
          onClick={() => fileRef.current?.click()}
        >
          <UploadIcon className="size-5 text-[#909090]" />
          <span className="text-sm text-[#909090]">
            {fileName || "HTML 파일을 선택하세요 (.html, .htm)"}
          </span>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".html,.htm"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button
        disabled={uploading || !title.trim() || !htmlContent.trim()}
        onClick={handleUpload}
        className="bg-[#34aa8f] text-white hover:bg-[#2d9a7f]"
      >
        {uploading ? "업로드 중..." : "등록"}
      </Button>
    </div>
  );
}

export default function BoardManager() {
  const [refreshKey, setRefreshKey] = useState(0);

  function refresh() {
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="notice">
        <TabsList>
          {BOARD_TYPES.map((bt) => (
            <TabsTrigger key={bt.value} value={bt.value}>
              {bt.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {BOARD_TYPES.map((bt) => (
          <TabsContent key={bt.value} value={bt.value} className="mt-6 space-y-8">
            <div>
              <h3 className="text-sm font-semibold text-[#505050] mb-4">
                HTML 파일 업로드
              </h3>
              <HtmlUploader boardType={bt.value} onUploaded={refresh} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#505050] mb-4">
                등록된 게시글
              </h3>
              <PostList
                key={`${bt.value}-${refreshKey}`}
                boardType={bt.value}
                onDelete={refresh}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
