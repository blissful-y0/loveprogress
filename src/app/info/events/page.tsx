"use client";

import { getPostsByType } from "@/lib/mock-board-data";
import BoardListPage from "@/components/board/board-list-page";

export default function EventsPage() {
  const posts = getPostsByType("event");

  return (
    <BoardListPage
      title="학내 행사 안내"
      basePath="/info/events"
      emptyMessage="등록된 행사 안내가 없습니다."
      posts={posts}
    />
  );
}
