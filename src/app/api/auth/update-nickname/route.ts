import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";

const updateNicknameSchema = z.object({
  nickname: z
    .string()
    .min(1, "닉네임을 입력해주세요.")
    .max(20, "닉네임은 20자 이하여야 합니다."),
});

export async function POST(request: Request) {
  const rateLimitResponse = await rateLimit(request, "update-nickname", {
    maxRequests: 5,
    windowMs: 60 * 1000,
  });
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const body = await request.json();

    const parsed = updateNicknameSchema.safeParse(body);
    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { nickname } = parsed.data;

    const supabaseAdmin = getSupabaseAdmin();

    // 닉네임 중복 확인 (자기 자신 제외)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabaseAdmin.from("users") as any)
      .select("id")
      .eq("nickname", nickname)
      .neq("id", user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "이미 사용 중인 닉네임입니다." },
        { status: 409 },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabaseAdmin.from("users") as any)
      .update({ nickname })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: "닉네임 변경에 실패했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, nickname });
  } catch {
    return NextResponse.json(
      { error: "닉네임 변경에 실패했습니다." },
      { status: 500 },
    );
  }
}
