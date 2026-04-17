import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";

const checkNicknameSchema = z.object({
  nickname: z
    .string()
    .min(1, "닉네임을 입력해주세요.")
    .max(20, "닉네임은 20자 이하여야 합니다."),
});

export async function POST(request: Request) {
  const rateLimitResponse = await rateLimit(request, "check-nickname", {
    maxRequests: 10,
    windowMs: 60 * 1000,
  });
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();

    const parsed = checkNicknameSchema.safeParse(body);
    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { nickname } = parsed.data;

    const supabaseAdmin = getSupabaseAdmin();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error: queryError } = await (
      supabaseAdmin.from("users") as any
    )
      .select("id")
      .eq("nickname", nickname)
      .maybeSingle();

    if (queryError) {
      return NextResponse.json(
        { error: "닉네임 확인에 실패했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({ available: data === null });
  } catch {
    return NextResponse.json(
      { error: "닉네임 확인에 실패했습니다." },
      { status: 500 },
    );
  }
}
