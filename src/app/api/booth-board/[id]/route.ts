import { NextResponse } from "next/server";
import { z } from "zod";

import { isErrorResponse, requireRole } from "@/lib/auth-guard";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { BoardPostRow } from "@/types/database";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const BOOTH_ROLES = ["booth_member", "admin"] as const;

const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(10000).optional(),
  isSecret: z.boolean().optional(),
});

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const auth = await requireRole(BOOTH_ROLES);
    if (isErrorResponse(auth)) return auth;

    const { id } = await params;
    const supabaseAdmin = getSupabaseAdmin();

    const { data: post, error } = await supabaseAdmin
      .from("board_posts")
      .select("*")
      .eq("id", id)
      .eq("board_type", "booth_private")
      .single<BoardPostRow>();

    if (error || !post) {
      return NextResponse.json(
        { error: "게시글을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // Secret post: only visible to author or admin
    if (post.is_secret && post.author_user_id !== auth.userId && auth.role !== "admin") {
      return NextResponse.json(
        { error: "비밀글은 작성자만 확인할 수 있습니다." },
        { status: 403 },
      );
    }

    // Fetch comments for the post
    const { data: comments } = await supabaseAdmin
      .from("board_comments")
      .select("*")
      .eq("post_id", id)
      .order("created_at", { ascending: true });

    // Prev / Next navigation (based on created_at) — exclude secret posts
    const { data: prevPost } = await supabaseAdmin
      .from("board_posts")
      .select("id, title")
      .eq("board_type", "booth_private")
      .eq("is_secret", false)
      .lt("created_at", post.created_at)
      .order("created_at", { ascending: false })
      .limit(1)
      .single<{ id: string; title: string }>();

    const { data: nextPost } = await supabaseAdmin
      .from("board_posts")
      .select("id, title")
      .eq("board_type", "booth_private")
      .eq("is_secret", false)
      .gt("created_at", post.created_at)
      .order("created_at", { ascending: true })
      .limit(1)
      .single<{ id: string; title: string }>();

    return NextResponse.json({
      post,
      comments: comments ?? [],
      prevPost: prevPost ?? null,
      nextPost: nextPost ?? null,
    });
  } catch {
    return NextResponse.json(
      { error: "게시글을 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const auth = await requireRole(BOOTH_ROLES);
    if (isErrorResponse(auth)) return auth;

    const { id } = await params;
    const body = await request.json();

    const parsed = updatePostSchema.safeParse(body);
    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Check post exists and user is author or admin
    const { data: existing } = await supabaseAdmin
      .from("board_posts")
      .select("author_user_id")
      .eq("id", id)
      .eq("board_type", "booth_private")
      .single<{ author_user_id: string }>();

    if (!existing) {
      return NextResponse.json(
        { error: "게시글을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    if (existing.author_user_id !== auth.userId && auth.role !== "admin") {
      return NextResponse.json(
        { error: "수정 권한이 없습니다." },
        { status: 403 },
      );
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
    if (parsed.data.content !== undefined) updateData.content = parsed.data.content;
    if (parsed.data.isSecret !== undefined) updateData.is_secret = parsed.data.isSecret;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "수정할 내용이 없습니다." },
        { status: 400 },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: post, error } = await (supabaseAdmin.from("board_posts") as any)
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "게시글 수정에 실패했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({ post });
  } catch {
    return NextResponse.json(
      { error: "게시글 수정에 실패했습니다." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const auth = await requireRole(BOOTH_ROLES);
    if (isErrorResponse(auth)) return auth;

    const { id } = await params;
    const supabaseAdmin = getSupabaseAdmin();

    const { data: existing } = await supabaseAdmin
      .from("board_posts")
      .select("author_user_id")
      .eq("id", id)
      .eq("board_type", "booth_private")
      .single<{ author_user_id: string }>();

    if (!existing) {
      return NextResponse.json(
        { error: "게시글을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    if (existing.author_user_id !== auth.userId && auth.role !== "admin") {
      return NextResponse.json(
        { error: "삭제 권한이 없습니다." },
        { status: 403 },
      );
    }

    // FK CASCADE on board_comments.post_id handles comment cleanup
    const { error } = await supabaseAdmin
      .from("board_posts")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "게시글 삭제에 실패했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "게시글 삭제에 실패했습니다." },
      { status: 500 },
    );
  }
}
