import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { QnaAnswerRow } from "@/types/database";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const answerSchema = z.object({
  content: z
    .string()
    .min(1, "답변 내용을 입력해주세요.")
    .max(5000, "답변은 5000자 이하여야 합니다."),
});

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const supabaseAuth = await createClient();
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = (await (supabaseAdmin.from("users") as any)
      .select("role")
      .eq("id", user.id)
      .single()) as {
      data: { role: string } | null;
      error: unknown;
    };

    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { error: "관리자만 답변할 수 있습니다." },
        { status: 403 },
      );
    }

    const { id: qnaPostId } = await params;

    if (!qnaPostId) {
      return NextResponse.json(
        { error: "존재하지 않는 문의입니다." },
        { status: 404 },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: qnaPost } = (await (
      supabaseAdmin.from("qna_posts") as any
    )
      .select("id")
      .eq("id", qnaPostId)
      .single()) as {
      data: { id: string } | null;
      error: unknown;
    };

    if (!qnaPost) {
      return NextResponse.json(
        { error: "존재하지 않는 문의입니다." },
        { status: 404 },
      );
    }

    const body = await request.json();
    const parsed = answerSchema.safeParse(body);
    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = (await (
      supabaseAdmin.from("qna_answers") as any
    )
      .select("id")
      .eq("qna_post_id", qnaPostId)
      .single()) as {
      data: { id: string } | null;
      error: unknown;
    };

    let answer: QnaAnswerRow | null = null;
    let answerError: unknown = null;

    if (existing) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (await (supabaseAdmin.from("qna_answers") as any)
        .update({
          content: parsed.data.content,
          admin_user_id: user.id,
        })
        .eq("id", existing.id)
        .select(
          "id, qna_post_id, admin_user_id, content, created_at, updated_at",
        )
        .single()) as {
        data: QnaAnswerRow | null;
        error: unknown;
      };
      answer = result.data;
      answerError = result.error;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (await (supabaseAdmin.from("qna_answers") as any)
        .insert({
          qna_post_id: qnaPostId,
          admin_user_id: user.id,
          content: parsed.data.content,
        })
        .select(
          "id, qna_post_id, admin_user_id, content, created_at, updated_at",
        )
        .single()) as {
        data: QnaAnswerRow | null;
        error: unknown;
      };
      answer = result.data;
      answerError = result.error;
    }

    if (answerError || !answer) {
      return NextResponse.json(
        { error: "답변 저장에 실패했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({ answer }, { status: existing ? 200 : 201 });
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const supabaseAuth = await createClient();
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = (await (supabaseAdmin.from("users") as any)
      .select("role")
      .eq("id", user.id)
      .single()) as { data: { role: string } | null };

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "관리자만 삭제할 수 있습니다." }, { status: 403 });
    }

    const { id: qnaPostId } = await params;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabaseAdmin.from("qna_answers") as any)
      .delete()
      .eq("qna_post_id", qnaPostId);

    if (error) {
      return NextResponse.json({ error: "답변 삭제에 실패했습니다." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
