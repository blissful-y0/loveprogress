import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const adminCheck = await requireAdmin(request);
    if (adminCheck.error) return adminCheck.error;

    const { id: qnaPostId } = await params;
    const supabaseAdmin = getSupabaseAdmin();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: post } = (await (supabaseAdmin.from("qna_posts") as any)
      .select("id, is_hidden")
      .eq("id", qnaPostId)
      .single()) as {
      data: { id: string; is_hidden: boolean } | null;
      error: unknown;
    };

    if (!post) {
      return NextResponse.json(
        { error: "존재하지 않는 문의입니다." },
        { status: 404 },
      );
    }

    const newHiddenState = !post.is_hidden;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabaseAdmin.from("qna_posts") as any)
      .update({ is_hidden: newHiddenState })
      .eq("id", qnaPostId);

    if (updateError) {
      return NextResponse.json(
        { error: "숨김 처리에 실패했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({ is_hidden: newHiddenState });
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
