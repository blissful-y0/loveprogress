import { notFound } from "next/navigation";
import { getPostById, getAdjacentPosts } from "@/lib/mock-board-data";
import BoardDetailPage from "@/components/board/board-detail-page";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const post = getPostById("event", id);

  if (!post) {
    notFound();
  }

  const { prev, next } = getAdjacentPosts("event", id);

  return (
    <BoardDetailPage
      basePath="/info/events"
      post={post}
      prevPost={prev}
      nextPost={next}
    />
  );
}
