import { createClient } from "@/lib/supabase/server";
import BoardListPage from "@/components/board/board-list-page";
import type { BoardPostRow } from "@/types/database";

const ITEMS_PER_PAGE = 10;

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function EventsPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? "1"));
  const offset = (page - 1) * ITEMS_PER_PAGE;

  const supabase = await createClient();

  const { data: pinnedPosts } = await supabase
    .from("board_posts")
    .select("*")
    .eq("board_type", "event")
    .eq("is_pinned", true)
    .order("created_at", { ascending: false })
    .returns<BoardPostRow[]>();

  const { count } = await supabase
    .from("board_posts")
    .select("*", { count: "exact", head: true })
    .eq("board_type", "event");

  const total = count ?? 0;

  const { data: regularPosts } = await supabase
    .from("board_posts")
    .select("*")
    .eq("board_type", "event")
    .eq("is_pinned", false)
    .order("created_at", { ascending: false })
    .range(offset, offset + ITEMS_PER_PAGE - 1)
    .returns<BoardPostRow[]>();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (authUser) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", authUser.id)
      .single<{ role: string }>();
    isAdmin = profile?.role === "admin";
  }

  const totalRegular = total - (pinnedPosts?.length ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalRegular / ITEMS_PER_PAGE));

  return (
    <BoardListPage
      title="학내 행사 안내"
      basePath="/info/events"
      emptyMessage="등록된 행사 안내가 없습니다."
      pinnedPosts={pinnedPosts ?? []}
      regularPosts={regularPosts ?? []}
      total={total}
      page={page}
      totalPages={totalPages}
      isAdmin={isAdmin}
    />
  );
}
