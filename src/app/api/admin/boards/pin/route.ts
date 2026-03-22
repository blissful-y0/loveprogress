import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/require-admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const pinSchema = z.object({
  boardType: z.enum(["notice", "event", "booth_private"]),
  postId: z.string().uuid("올바른 게시글 ID가 아닙니다."),
});

export async function POST(request: Request) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck.error) return adminCheck.error;

  try {
    const body = await request.json();
    const parsed = pinSchema.safeParse(body);

    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { boardType, postId } = parsed.data;
    const supabaseAdmin = getSupabaseAdmin();

    // 1. Save currently pinned post IDs for rollback
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: previouslyPinned } = await (
      supabaseAdmin.from("board_posts") as any
    )
      .select("id")
      .eq("board_type", boardType)
      .eq("is_pinned", true);

    const previousPinnedIds: string[] = (previouslyPinned ?? []).map(
      (p: { id: string }) => p.id,
    );

    // 2. Unpin all existing pinned posts of this board type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: unpinError } = await (
      supabaseAdmin.from("board_posts") as any
    )
      .update({ is_pinned: false })
      .eq("board_type", boardType)
      .eq("is_pinned", true);

    if (unpinError) {
      return NextResponse.json(
        { error: "기존 고정 해제에 실패했습니다." },
        { status: 500 },
      );
    }

    // 3. Pin the selected post
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: pinError } = await (
      supabaseAdmin.from("board_posts") as any
    )
      .update({ is_pinned: true })
      .eq("id", postId)
      .eq("board_type", boardType);

    if (pinError) {
      // Rollback: restore previously pinned posts
      for (const prevId of previousPinnedIds) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabaseAdmin.from("board_posts") as any)
          .update({ is_pinned: true })
          .eq("id", prevId);
      }

      return NextResponse.json(
        { error: "게시글 고정에 실패했습니다. 이전 상태로 복원되었습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "잘못된 요청입니다." },
      { status: 400 },
    );
  }
}
