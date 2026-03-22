import { NextResponse } from "next/server";
import { z } from "zod";

import { isErrorResponse, requireRole } from "@/lib/auth-guard";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { BoardPostInsert } from "@/types/database";

const BOOTH_ROLES = ["booth_member", "admin"] as const;

const createPostSchema = z.object({
  title: z
    .string()
    .min(1, "제목을 입력해주세요.")
    .max(200, "제목은 200자 이하여야 합니다."),
  content: z
    .string()
    .min(1, "내용을 입력해주세요.")
    .max(10000, "내용은 10000자 이하여야 합니다."),
  isSecret: z.boolean().optional().default(false),
});

export async function GET(request: Request) {
  try {
    const auth = await requireRole(BOOTH_ROLES);
    if (isErrorResponse(auth)) return auth;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 10));
    const offset = (page - 1) * limit;

    const supabaseAdmin = getSupabaseAdmin();

    const { count } = await supabaseAdmin
      .from("board_posts")
      .select("id", { count: "exact", head: true })
      .eq("board_type", "booth_private");

    const { count: pinnedCount } = await supabaseAdmin
      .from("board_posts")
      .select("id", { count: "exact", head: true })
      .eq("board_type", "booth_private")
      .eq("is_pinned", true);

    const { data: posts, error } = await supabaseAdmin
      .from("board_posts")
      .select("*")
      .eq("board_type", "booth_private")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        { error: "게시글 목록을 불러오지 못했습니다." },
        { status: 500 },
      );
    }

    const safePosts = (posts ?? []).map((post) => {
      if (post.is_secret && post.author_user_id !== auth.userId && auth.role !== "admin") {
        return { ...post, title: "비밀글입니다.", content: "" };
      }
      return post;
    });

    return NextResponse.json({
      posts: safePosts,
      total: count ?? 0,
      pinnedCount: pinnedCount ?? 0,
      page,
      limit,
    });
  } catch {
    return NextResponse.json(
      { error: "게시글 목록을 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireRole(BOOTH_ROLES);
    if (isErrorResponse(auth)) return auth;

    const body = await request.json();

    const parsed = createPostSchema.safeParse(body);
    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { title, content, isSecret } = parsed.data;

    const supabaseAdmin = getSupabaseAdmin();

    const insertData: BoardPostInsert = {
      board_type: "booth_private",
      title,
      content,
      author_user_id: auth.userId,
      author_display_name: auth.nickname,
      is_pinned: false,
      is_secret: isSecret,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: post, error } = await (supabaseAdmin.from("board_posts") as any)
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "게시글 작성에 실패했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({ post }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "게시글 작성에 실패했습니다." },
      { status: 500 },
    );
  }
}
