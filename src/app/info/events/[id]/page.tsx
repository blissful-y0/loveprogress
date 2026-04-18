import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BoardDetailPage from "@/components/board/board-detail-page";
import type { BoardPostRow } from "@/types/database";

interface Props {
  params: Promise<{ id: string }>;
}

interface AdjacentPost {
  id: string;
  title: string;
}

export const revalidate = 3600;

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // 1단계: post + auth 병렬 (둘 다 독립, post 없으면 notFound)
  const [postRes, authRes] = await Promise.all([
    supabase
      .from("board_posts")
      .select("*")
      .eq("id", id)
      .eq("board_type", "event")
      .single<BoardPostRow>(),
    supabase.auth.getUser(),
  ]);

  const post = postRes.data;
  if (postRes.error || !post) {
    notFound();
  }

  const authUser = authRes.data.user;

  // 2단계: prev/next/profile 병렬 (post.created_at이 확정된 이후)
  const [nextRes, prevRes, profileRes] = await Promise.all([
    supabase
      .from("board_posts")
      .select("id, title")
      .eq("board_type", "event")
      .gt("created_at", post.created_at)
      .order("created_at", { ascending: true })
      .limit(1)
      .single<AdjacentPost>(),
    supabase
      .from("board_posts")
      .select("id, title")
      .eq("board_type", "event")
      .lt("created_at", post.created_at)
      .order("created_at", { ascending: false })
      .limit(1)
      .single<AdjacentPost>(),
    authUser
      ? supabase
          .from("users")
          .select("role")
          .eq("id", authUser.id)
          .single<{ role: string }>()
      : Promise.resolve({ data: null }),
  ]);

  const nextPost = nextRes.data;
  const prevPost = prevRes.data;
  const isAdmin = profileRes.data?.role === "admin";
  const isAuthor = !!authUser && authUser.id === post.author_user_id;

  return (
    <BoardDetailPage
      basePath="/info/events"
      post={post}
      prevPost={prevPost ?? null}
      nextPost={nextPost ?? null}
      isAdmin={isAdmin}
      isAuthor={isAuthor}
    />
  );
}
