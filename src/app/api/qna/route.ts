import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { hashPassword } from "@/app/qna/_lib/secret-qna.server";
import { QNA_PAGE_LIMIT } from "@/app/qna/_lib/constants";
import type { QnaPostPublic } from "@/types/database";

const createQnaSchema = z.object({
  writerName: z
    .string()
    .min(1, "이름을 입력해주세요.")
    .max(20, "이름은 20자 이하여야 합니다."),
  password: z
    .string()
    .min(4, "비밀번호는 4자 이상이어야 합니다.")
    .max(10, "비밀번호는 10자 이하여야 합니다.")
    .optional(),
  isSecret: z.boolean(),
  imageKey: z.string().nullable().optional(),
  content: z
    .string()
    .min(1, "내용을 입력해주세요.")
    .max(2000, "내용은 2000자 이하여야 합니다."),
  consentToPrivacy: z.literal(true, {
    error: "개인정보 수집 및 이용에 동의해주세요.",
  }),
});

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "0.0.0.0";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(
      50,
      Math.max(1, Number(searchParams.get("limit")) || QNA_PAGE_LIMIT),
    );
    const offset = (page - 1) * limit;

    const supabase = getSupabaseAdmin();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count, error: countError } = await (
      supabase.from("qna_posts") as any
    ).select("*", { count: "exact", head: true });

    if (countError) {
      return NextResponse.json(
        { error: "목록을 불러오는 데 실패했습니다." },
        { status: 500 },
      );
    }

    const total = (count as number | null) ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: posts, error: postsError } = (await (
      supabase.from("qna_posts") as any
    )
      .select(
        "id, writer_name, is_secret, image_key, content, consent_to_privacy, created_at",
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)) as {
      data: QnaPostPublic[] | null;
      error: unknown;
    };

    if (postsError || !posts) {
      return NextResponse.json(
        { error: "목록을 불러오는 데 실패했습니다." },
        { status: 500 },
      );
    }

    const postIds = posts.map((p) => p.id);
    let answers: Record<string, { content: string }> = {};

    if (postIds.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: answersData } = (await (
        supabase.from("qna_answers") as any
      )
        .select("qna_post_id, content")
        .in("qna_post_id", postIds)) as {
        data: Array<{ qna_post_id: string; content: string }> | null;
      };

      if (answersData) {
        answers = Object.fromEntries(
          answersData.map((a) => [a.qna_post_id, { content: a.content }]),
        );
      }
    }

    const publicPosts = posts.map((post) => {
      const answer = answers[post.id] ?? null;
      return {
        ...post,
        content: post.is_secret ? "" : post.content,
        answer: post.is_secret ? null : answer?.content ?? null,
        hasAnswer: answer !== null,
      };
    });

    return NextResponse.json({
      posts: publicPosts,
      total,
      page,
      totalPages,
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
    const body = await request.json();

    const parsed = createQnaSchema.safeParse(body);
    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { writerName, password, isSecret, imageKey, content } = parsed.data;

    if (isSecret && (!password || password.length === 0)) {
      return NextResponse.json(
        { error: "비밀글에는 비밀번호가 필요합니다." },
        { status: 400 },
      );
    }

    const clientIp = getClientIp(request);
    const passwordHash =
      isSecret && password ? await hashPassword(password) : null;

    const supabase = getSupabaseAdmin();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: post, error: insertError } = (await (
      supabase.from("qna_posts") as any
    )
      .insert({
        writer_name: writerName,
        password_hash: passwordHash,
        is_secret: isSecret,
        image_key: imageKey ?? null,
        content,
        consent_to_privacy: true,
        created_ip: clientIp,
      })
      .select(
        "id, writer_name, is_secret, image_key, content, consent_to_privacy, created_at",
      )
      .single()) as {
      data: QnaPostPublic | null;
      error: unknown;
    };

    if (insertError || !post) {
      return NextResponse.json(
        { error: "글 작성에 실패했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({ post }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
