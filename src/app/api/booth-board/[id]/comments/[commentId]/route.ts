import { NextResponse } from "next/server";

import { isErrorResponse, requireRole } from "@/lib/auth-guard";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type RouteContext = {
  params: Promise<{ id: string; commentId: string }>;
};

const BOOTH_ROLES = ["booth_member", "admin"] as const;

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const auth = await requireRole(BOOTH_ROLES);
    if (isErrorResponse(auth)) return auth;

    const { id, commentId } = await params;
    const supabaseAdmin = getSupabaseAdmin();

    // Verify the comment exists and belongs to this post
    const { data: comment } = await supabaseAdmin
      .from("board_comments")
      .select("author_user_id")
      .eq("id", commentId)
      .eq("post_id", id)
      .single<{ author_user_id: string }>();

    if (!comment) {
      return NextResponse.json(
        { error: "댓글을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    if (comment.author_user_id !== auth.userId && auth.role !== "admin") {
      return NextResponse.json(
        { error: "삭제 권한이 없습니다." },
        { status: 403 },
      );
    }

    const { error } = await supabaseAdmin
      .from("board_comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      return NextResponse.json(
        { error: "댓글 삭제에 실패했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "댓글 삭제에 실패했습니다." },
      { status: 500 },
    );
  }
}
