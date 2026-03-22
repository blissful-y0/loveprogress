import { NextResponse } from "next/server";
import { z } from "zod";

import { isErrorResponse, requireRole } from "@/lib/auth-guard";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { BoardCommentInsert } from "@/types/database";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const BOOTH_ROLES = ["booth_member", "admin"] as const;

const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "댓글 내용을 입력해주세요.")
    .max(2000, "댓글은 2000자 이하여야 합니다."),
});

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const auth = await requireRole(BOOTH_ROLES);
    if (isErrorResponse(auth)) return auth;

    const { id } = await params;
    const supabaseAdmin = getSupabaseAdmin();

    // Verify the post exists and belongs to booth_private
    const { data: post } = await supabaseAdmin
      .from("board_posts")
      .select("id")
      .eq("id", id)
      .eq("board_type", "booth_private")
      .single<{ id: string }>();

    if (!post) {
      return NextResponse.json(
        { error: "게시글을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    const { data: comments, error } = await supabaseAdmin
      .from("board_comments")
      .select("*")
      .eq("post_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: "댓글 목록을 불러오지 못했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({ comments: comments ?? [] });
  } catch {
    return NextResponse.json(
      { error: "댓글 목록을 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const auth = await requireRole(BOOTH_ROLES);
    if (isErrorResponse(auth)) return auth;

    const { id } = await params;
    const body = await request.json();

    const parsed = createCommentSchema.safeParse(body);
    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Verify the post exists
    const { data: post } = await supabaseAdmin
      .from("board_posts")
      .select("id")
      .eq("id", id)
      .eq("board_type", "booth_private")
      .single<{ id: string }>();

    if (!post) {
      return NextResponse.json(
        { error: "게시글을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    const insertData: BoardCommentInsert = {
      post_id: id,
      author_user_id: auth.userId,
      author_display_name: auth.nickname,
      content: parsed.data.content,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: comment, error } = await (supabaseAdmin.from("board_comments") as any)
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "댓글 작성에 실패했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({ comment }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "댓글 작성에 실패했습니다." },
      { status: 500 },
    );
  }
}
