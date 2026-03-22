import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient as createAnonClient } from "@supabase/supabase-js";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";
import type { UserInsert } from "@/types/database";

const registerSchema = z.object({
  nickname: z
    .string()
    .min(1, "닉네임을 입력해주세요.")
    .max(20, "닉네임은 20자 이하여야 합니다."),
  email: z.string().email("올바른 이메일 형식을 입력해주세요."),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다."),
  boothName: z.string().max(50).optional(),
  phoneLast4: z
    .string()
    .regex(/^\d{4}$/, "휴대폰번호 뒷자리는 숫자 4자리여야 합니다.")
    .optional(),
});

function isDuplicateNicknameError(error: unknown): boolean {
  const candidate = error as
    | { code?: string; message?: string; details?: string }
    | null
    | undefined;

  if (!candidate) return false;

  return (
    candidate.code === "23505" &&
    `${candidate.message ?? ""} ${candidate.details ?? ""}`.includes("nickname")
  );
}

export async function POST(request: Request) {
  // Rate limiting: 5 requests per 10 minutes per IP
  const rateLimitResponse = await rateLimit(request, "auth-register", {
    maxRequests: 5,
    windowMs: 10 * 60 * 1000,
  });
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { nickname, email, password, boothName, phoneLast4 } = parsed.data;

    const supabaseAdmin = getSupabaseAdmin();

    // 1. signUp으로 auth user 생성 — Supabase가 인증 메일을 자동 발송
    const anonClient = createAnonClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { data: authData, error: authError } = await anonClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://loveprogress.vercel.app"}/`,
      },
    });

    if (authError || !authData.user) {
      const code = (authError as { code?: string } | null)?.code ?? "";
      if (code === "user_already_exists" || authError?.message?.includes("already registered")) {
        return NextResponse.json({ error: "이미 가입된 이메일입니다." }, { status: 409 });
      }
      if (code === "email_address_invalid") {
        return NextResponse.json({ error: "유효하지 않은 이메일 주소입니다." }, { status: 400 });
      }
      if (code === "over_email_send_rate_limit") {
        return NextResponse.json({ error: "잠시 후 다시 시도해주세요." }, { status: 429 });
      }
      return NextResponse.json({ error: "회원가입에 실패했습니다." }, { status: 400 });
    }

    // email_confirm 활성화 시 중복 이메일은 identities 배열이 비어 있음 (email enumeration 방지)
    if (!authData.user.identities || authData.user.identities.length === 0) {
      return NextResponse.json({ error: "이미 가입된 이메일입니다." }, { status: 409 });
    }

    // 2. 프로필 생성
    const insertData: UserInsert = {
      id: authData.user.id,
      nickname,
      email,
      booth_name: boothName ?? null,
      phone_last4: phoneLast4 ?? null,
      role: "member",
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: profileError } = await (
      supabaseAdmin.from("users") as any
    ).insert(insertData);

    if (profileError) {
      // 롤백: auth user 삭제 (단, 기존 유저 ID가 아님이 identities 검사로 이미 확인됨)
      console.error("Profile insert error:", profileError);
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      if (isDuplicateNicknameError(profileError)) {
        return NextResponse.json(
          { error: "이미 사용 중인 닉네임입니다." },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { error: "회원가입에 실패했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "회원가입에 실패했습니다." },
      { status: 500 },
    );
  }
}
