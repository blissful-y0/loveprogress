import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

const resetPasswordSchema = z.object({
  email: z.string().email("올바른 이메일 형식을 입력해주세요."),
});

const DEFAULT_RESET_PASSWORD = "702430";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { email } = parsed.data;

    const supabaseAdmin = getSupabaseAdmin();

    // 1. users 테이블에서 유저 존재 확인
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: user, error: queryError } = await (
      supabaseAdmin.from("users") as any
    )
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (queryError) {
      return NextResponse.json(
        { error: "비밀번호 재설정에 실패했습니다." },
        { status: 500 },
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "등록되지 않은 이메일입니다." },
        { status: 404 },
      );
    }

    // 2. auth user 비밀번호를 기본값으로 재설정
    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password: DEFAULT_RESET_PASSWORD,
      });

    if (updateError) {
      return NextResponse.json(
        { error: "비밀번호 재설정에 실패했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "비밀번호 재설정에 실패했습니다." },
      { status: 500 },
    );
  }
}
