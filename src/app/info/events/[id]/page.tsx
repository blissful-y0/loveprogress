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

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from("board_posts")
    .select("*")
    .eq("id", id)
    .eq("board_type", "event")
    .single<BoardPostRow>();

  if (error || !post) {
    notFound();
  }

  const { data: nextPost } = await supabase
    .from("board_posts")
    .select("id, title")
    .eq("board_type", "event")
    .gt("created_at", post.created_at)
    .order("created_at", { ascending: true })
    .limit(1)
    .single<AdjacentPost>();

  const { data: prevPost } = await supabase
    .from("board_posts")
    .select("id, title")
    .eq("board_type", "event")
    .lt("created_at", post.created_at)
    .order("created_at", { ascending: false })
    .limit(1)
    .single<AdjacentPost>();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  let isAuthor = false;

  if (authUser) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", authUser.id)
      .single<{ role: string }>();
    isAdmin = profile?.role === "admin";
    isAuthor = authUser.id === post.author_user_id;
  }

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
