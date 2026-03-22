import { NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { QnaPostPublic, QnaAnswerRow } from "@/types/database";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "존재하지 않는 문의입니다." },
        { status: 404 },
      );
    }

    const supabase = getSupabaseAdmin();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: post, error: postError } = (await (
      supabase.from("qna_posts") as any
    )
      .select(
        "id, writer_name, is_secret, image_key, content, consent_to_privacy, created_ip, created_at",
      )
      .eq("id", id)
      .single()) as {
      data: QnaPostPublic | null;
      error: unknown;
    };

    if (postError || !post) {
      return NextResponse.json(
        { error: "존재하지 않는 문의입니다." },
        { status: 404 },
      );
    }

    if (post.is_secret) {
      return NextResponse.json({
        post: {
          ...post,
          content: "",
        },
        answer: null,
        isSecret: true,
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: answer } = (await (supabase.from("qna_answers") as any)
      .select("id, qna_post_id, admin_user_id, content, created_at, updated_at")
      .eq("qna_post_id", id)
      .single()) as {
      data: QnaAnswerRow | null;
      error: unknown;
    };

    return NextResponse.json({
      post,
      answer: answer ?? null,
      isSecret: false,
    });
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
