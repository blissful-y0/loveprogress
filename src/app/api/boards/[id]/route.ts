import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { BoardPostRow } from "@/types/database";

type RouteContext = {
  params: Promise<{ id: string }>;
};

interface AdjacentPost {
  id: string;
  title: string;
}

const updatePostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "제목을 입력해주세요.")
    .max(200, "제목은 200자 이하여야 합니다.")
    .optional(),
  content: z
    .string()
    .trim()
    .min(1, "내용을 입력해주세요.")
    .max(10000, "내용은 10000자 이하여야 합니다.")
    .optional(),
});

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: "유효하지 않은 게시글 ID입니다." },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const { data: post, error } = await supabase
      .from("board_posts")
      .select("*")
      .eq("id", id)
      .single<BoardPostRow>();

    if (error || !post) {
      return NextResponse.json(
        { error: "게시글을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    const { data: nextPost } = await supabase
      .from("board_posts")
      .select("id, title")
      .eq("board_type", post.board_type)
      .gt("created_at", post.created_at)
      .order("created_at", { ascending: true })
      .limit(1)
      .single<AdjacentPost>();

    const { data: prevPost } = await supabase
      .from("board_posts")
      .select("id, title")
      .eq("board_type", post.board_type)
      .lt("created_at", post.created_at)
      .order("created_at", { ascending: false })
      .limit(1)
      .single<AdjacentPost>();

    return NextResponse.json({
      post,
      prev: prevPost ?? null,
      next: nextPost ?? null,
    });
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: "유효하지 않은 게시글 ID입니다." },
        { status: 400 },
      );
    }

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
      .select("role")
      .eq("id", authUser.id)
      .single<{ role: string }>();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = updatePostSchema.safeParse(body);

    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const updateData = parsed.data;

    if (!updateData.title && !updateData.content) {
      return NextResponse.json(
        { error: "수정할 내용이 없습니다." },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: post, error } = await supabaseAdmin
      .from("board_posts")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error || !post) {
      return NextResponse.json(
        { error: "게시글 수정에 실패했습니다." },
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
