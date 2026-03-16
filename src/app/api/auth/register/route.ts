import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
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

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const firstError =
        parsed.error.errors[0]?.message ?? "입력값이 올바르지 않습니다.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { nickname, email, password, boothName, phoneLast4 } = parsed.data;

    const supabaseAdmin = getSupabaseAdmin();

    // 1. 서버에서 auth user 생성
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      console.error("Auth createUser error:", authError);
      return NextResponse.json(
        { error: "회원가입에 실패했습니다." },
        { status: 400 },
      );
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
      // 롤백: auth user 삭제
      console.error("Profile insert error:", profileError);
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
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
