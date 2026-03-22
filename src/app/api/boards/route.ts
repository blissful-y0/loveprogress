import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { BoardType } from "@/types/database";

const createPostSchema = z.object({
  boardType: z.enum(["notice", "event"]),
  title: z
    .string()
    .min(1, "제목을 입력해주세요.")
    .max(200, "제목은 200자 이하여야 합니다."),
  content: z
    .string()
    .min(1, "내용을 입력해주세요.")
    .max(10000, "내용은 10000자 이하여야 합니다."),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as BoardType | null;
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? "10")));

    if (!type || !["notice", "event"].includes(type)) {
      return NextResponse.json(
        { error: "type 파라미터가 필요합니다. (notice 또는 event)" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const offset = (page - 1) * limit;

    const { count } = await supabase
      .from("board_posts")
      .select("*", { count: "exact", head: true })
      .eq("board_type", type);

    const total = count ?? 0;

    const { data: posts, error } = await supabase
      .from("board_posts")
      .select("*")
      .eq("board_type", type)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        { error: "게시글 목록을 불러오는데 실패했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      posts: posts ?? [],
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role, nickname")
      .eq("id", authUser.id)
      .single<{ role: string; nickname: string }>();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = createPostSchema.safeParse(body);

    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { boardType, title, content } = parsed.data;

    const supabaseAdmin = getSupabaseAdmin();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: post, error } = await (
      supabaseAdmin.from("board_posts") as any
    ).insert({
      board_type: boardType,
      title,
      content,
      author_user_id: authUser.id,
      author_display_name: profile.nickname,
      is_pinned: false,
      is_secret: false,
    }).select().single();

    if (error) {
      return NextResponse.json(
        { error: "게시글 작성에 실패했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, post });
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
