import { createClient } from "@/lib/supabase/server";
import BoardListPage from "@/components/board/board-list-page";
import type { BoardPostRow } from "@/types/database";

export const metadata = {
  title: "공지사항 | 파이낙사 온리전 :: 사랑의 진도",
};

export const revalidate = 30;

const ITEMS_PER_PAGE = 10;

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function NoticesPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const rawPage = Number(pageParam ?? "1");
  const page = Number.isFinite(rawPage) ? Math.max(1, rawPage) : 1;

  const supabase = await createClient();

  // Stage 1: 서로 독립적인 쿼리 병렬 실행
  const [pinnedRes, countRes, authRes] = await Promise.all([
    supabase
      .from("board_posts")
      .select("*")
      .eq("board_type", "notice")
      .eq("is_pinned", true)
      .order("created_at", { ascending: false })
      .returns<BoardPostRow[]>(),
    supabase
      .from("board_posts")
      .select("*", { count: "exact", head: true })
      .eq("board_type", "notice"),
    supabase.auth.getUser(),
  ]);

  const pinnedPosts = pinnedRes.data;
  const count = countRes.count;
  const authUser = authRes.data.user;

  const total = count ?? 0;
  const totalRegular = total - (pinnedPosts?.length ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalRegular / ITEMS_PER_PAGE));
  const clampedPage = Math.min(page, totalPages);
  const offset = (clampedPage - 1) * ITEMS_PER_PAGE;

  // Stage 2: regularPosts + profile (authUser 있을 때만) 병렬 실행
  const [regularRes, profileRes] = await Promise.all([
    supabase
      .from("board_posts")
      .select("*")
      .eq("board_type", "notice")
      .eq("is_pinned", false)
      .order("created_at", { ascending: false })
      .range(offset, offset + ITEMS_PER_PAGE - 1)
      .returns<BoardPostRow[]>(),
    authUser
      ? supabase
          .from("users")
          .select("role")
          .eq("id", authUser.id)
          .single<{ role: string }>()
      : Promise.resolve({ data: null }),
  ]);

  const regularPosts = regularRes.data;
  const isAdmin = profileRes.data?.role === "admin";

  return (
    <BoardListPage
      title="입학처 공지사항"
      basePath="/info/notices"
      pageHeader={{
        title: "입학처 공지",
        subtitle: "신입생 및 재학생 대상의 공지사항을 안내합니다.",
      }}
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
