import { createClient } from "@/lib/supabase/server";
import BoardListPage from "@/components/board/board-list-page";
import type { BoardPostRow } from "@/types/database";

const ITEMS_PER_PAGE = 10;

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function NoticesPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const rawPage = Number(pageParam ?? "1");
  const page = Number.isFinite(rawPage) ? Math.max(1, rawPage) : 1;

  const supabase = await createClient();

  const { data: pinnedPosts } = await supabase
    .from("board_posts")
    .select("*")
    .eq("board_type", "notice")
    .eq("is_pinned", true)
    .order("created_at", { ascending: false })
    .returns<BoardPostRow[]>();

  const { count } = await supabase
    .from("board_posts")
    .select("*", { count: "exact", head: true })
    .eq("board_type", "notice");

  const total = count ?? 0;
  const totalRegular = total - (pinnedPosts?.length ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalRegular / ITEMS_PER_PAGE));
  const clampedPage = Math.min(page, totalPages);
  const offset = (clampedPage - 1) * ITEMS_PER_PAGE;

  const { data: regularPosts } = await supabase
    .from("board_posts")
    .select("*")
    .eq("board_type", "notice")
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

  return (
    <BoardListPage
      title="입학처 공지사항"
      basePath="/info/notices"
      emptyMessage="등록된 공지사항이 없습니다."
      pinnedPosts={pinnedPosts ?? []}
      regularPosts={regularPosts ?? []}
      totalRegular={totalRegular}
      page={clampedPage}
      totalPages={totalPages}
      itemsPerPage={ITEMS_PER_PAGE}
      isAdmin={isAdmin}
    />
  );
}
