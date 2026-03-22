"use client";

import { useCallback, useEffect, useState } from "react";
import { WriteForm } from "./write-form";
import { QnaCard } from "./qna-card";
import { Pagination } from "./pagination";
import { QNA_PAGE_LIMIT } from "../_lib/constants";

interface QnaPost {
  id: string;
  writer_name: string;
  is_secret: boolean;
  image_key: string | null;
  content: string;
  created_at: string;
  answer: string | null;
  hasAnswer: boolean;
}

interface QnaListResponse {
  posts: QnaPost[];
  total: number;
  page: number;
  totalPages: number;
}

export function QnaList() {
  const [posts, setPosts] = useState<QnaPost[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPosts = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/qna?page=${targetPage}&limit=${QNA_PAGE_LIMIT}`,
      );
      const data = (await response.json()) as
        | QnaListResponse
        | { error?: string };

      if (!response.ok) {
        setError(
          "error" in data && data.error
            ? data.error
            : "목록을 불러오는 데 실패했습니다.",
        );
        return;
      }

      const listData = data as QnaListResponse;
      setPosts(listData.posts);
      setTotal(listData.total);
      setPage(listData.page);
      setTotalPages(listData.totalPages);
    } catch {
      setError("서버와의 연결에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const handlePostCreated = () => {
    fetchPosts(1);
  };

  const handlePageChange = (newPage: number) => {
    fetchPosts(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Write form */}
      <WriteForm onPostCreated={handlePostCreated} totalCount={total} />

      {/* QnA list */}
      <div className="space-y-4">
        {loading && (
          <div className="text-center py-10 text-sm text-muted-foreground">
            로딩 중...
          </div>
        )}

        {error && (
          <div className="text-center py-10 text-sm text-red-500">{error}</div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-10 text-sm text-muted-foreground">
            아직 등록된 문의가 없습니다.
          </div>
        )}

        {!loading &&
          !error &&
          posts.map((post, idx) => (
            <QnaCard
              key={post.id}
              item={post}
              index={total - (page - 1) * QNA_PAGE_LIMIT - idx}
            />
          ))}
      </div>

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
}
