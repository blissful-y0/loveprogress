"use client";

import { getPostsByType } from "@/lib/mock-board-data";
import BoardListPage from "@/components/board/board-list-page";

export default function NoticesPage() {
  const posts = getPostsByType("notice");

  return (
    <BoardListPage
      title="입학처 공지사항"
      basePath="/info/notices"
      emptyMessage="등록된 공지사항이 없습니다."
      posts={posts}
    />
  );
}
