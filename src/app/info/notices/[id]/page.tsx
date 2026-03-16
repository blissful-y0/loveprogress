import { notFound } from "next/navigation";
import { getPostById, getAdjacentPosts } from "@/lib/mock-board-data";
import BoardDetailPage from "@/components/board/board-detail-page";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function NoticeDetailPage({ params }: Props) {
  const { id } = await params;
  const post = getPostById("notice", id);

  if (!post) {
    notFound();
  }

  const { prev, next } = getAdjacentPosts("notice", id);

  return (
    <BoardDetailPage
      basePath="/info/notices"
      post={post}
      prevPost={prev}
      nextPost={next}
    />
  );
}
