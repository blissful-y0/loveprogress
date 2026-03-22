import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";

const checkEmailSchema = z.object({
  email: z.string().email("올바른 이메일 형식을 입력해주세요."),
});

export async function POST(request: Request) {
  const rateLimitResponse = rateLimit(request, "check-email", {
    maxRequests: 10,
    windowMs: 60 * 1000,
  });
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();

    const parsed = checkEmailSchema.safeParse(body);
    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { email } = parsed.data;

    const supabaseAdmin = getSupabaseAdmin();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error: queryError } = await (
      supabaseAdmin.from("users") as any
    )
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (queryError) {
      return NextResponse.json(
        { error: "이메일 확인에 실패했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({ available: data === null });
  } catch {
    return NextResponse.json(
      { error: "이메일 확인에 실패했습니다." },
      { status: 500 },
    );
  }
}
