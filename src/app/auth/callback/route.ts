import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=oauth`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/auth/login?error=oauth`);
  }

  // 세션 교환 후 유저 정보 조회
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const supabaseAdmin = getSupabaseAdmin();

    // users 테이블에 프로필이 없으면 자동 생성 (소셜 로그인 최초)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabaseAdmin.from("users") as any)
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!existing) {
      let nickname =
        (user.user_metadata?.full_name as string | undefined) ??
        (user.user_metadata?.user_name as string | undefined) ??
        user.email?.split("@")[0] ??
        "사용자";

      // 닉네임 충돌 시 랜덤 접미사 추가
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: dupCheck } = await (supabaseAdmin.from("users") as any)
        .select("id")
        .eq("nickname", nickname)
        .maybeSingle();

      if (dupCheck) {
        nickname = `${nickname}_${Math.random().toString(36).slice(2, 6)}`;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertError } = await (supabaseAdmin.from("users") as any).insert({
        id: user.id,
        nickname,
        email: user.email ?? "",
        booth_name: null,
        phone_last4: null,
        role: "member",
      });

      if (insertError) {
        // profile 생성 실패 시에도 로그인은 유지, 닉네임 설정 유도
        const redirectUrl = new URL(next, origin);
        redirectUrl.searchParams.set("nickname_setup", "1");
        return NextResponse.redirect(redirectUrl.toString());
      }

      // 소셜 로그인 최초 가입 시 닉네임 설정 유도
      const redirectUrl = new URL(next, origin);
      redirectUrl.searchParams.set("nickname_setup", "1");
      return NextResponse.redirect(redirectUrl.toString());
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
