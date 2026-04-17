import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { QNA_PAGE_LIMIT } from "@/app/qna/_lib/constants";

export async function GET(request: Request) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck.error) return adminCheck.error;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || QNA_PAGE_LIMIT));
  const offset = (page - 1) * limit;

  const supabase = getSupabaseAdmin();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count, error: countError } = await (supabase.from("qna_posts") as any)
    .select("*", { count: "exact", head: true });

  if (countError) {
    return NextResponse.json({ error: "목록을 불러오는 데 실패했습니다." }, { status: 500 });
  }

  const total = (count as number | null) ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Admin: select all fields including content of secret posts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: posts, error: postsError } = await (supabase.from("qna_posts") as any)
    .select("id, writer_name, is_secret, image_key, content, is_hidden, created_at")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (postsError || !posts) {
    return NextResponse.json({ error: "목록을 불러오는 데 실패했습니다." }, { status: 500 });
  }

  const postIds = (posts as { id: string }[]).map((p) => p.id);
  let answers: Record<string, string> = {};

  if (postIds.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: answersData } = await (supabase.from("qna_answers") as any)
      .select("qna_post_id, content")
      .in("qna_post_id", postIds);

    if (answersData) {
      answers = Object.fromEntries(
        (answersData as { qna_post_id: string; content: string }[]).map((a) => [a.qna_post_id, a.content]),
      );
    }
  }

  const result = (posts as {
    id: string;
    writer_name: string;
    is_secret: boolean;
    image_key: string | null;
    content: string;
    is_hidden: boolean;
    created_at: string;
  }[]).map((post) => ({
    ...post,
    answer: answers[post.id] ?? null,
    hasAnswer: post.id in answers,
  }));

  return NextResponse.json({ posts: result, total, page, totalPages });
}
