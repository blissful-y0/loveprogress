import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const rateLimitResponse = await rateLimit(request, "withdraw", {
    maxRequests: 3,
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

    const supabaseAdmin = getSupabaseAdmin();

    // users 테이블에서 삭제
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: profileError } = await (supabaseAdmin.from("users") as any)
      .delete()
      .eq("id", user.id);

    if (profileError) {
      return NextResponse.json(
        { error: "회원 탈퇴에 실패했습니다." },
        { status: 500 },
      );
    }

    // Supabase Auth에서 사용자 삭제
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      user.id,
    );

    if (deleteError) {
      return NextResponse.json(
        { error: "회원 탈퇴에 실패했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "회원 탈퇴에 실패했습니다." },
      { status: 500 },
    );
  }
}
