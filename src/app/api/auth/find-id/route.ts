import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

const findIdSchema = z.object({
  nickname: z.string().min(1, "닉네임을 입력해주세요."),
  boothName: z.string().optional(),
});

function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return "****@****";

  const visibleLength = Math.min(4, localPart.length);
  const visible = localPart.slice(0, visibleLength);
  const masked = "*".repeat(Math.max(0, localPart.length - visibleLength));

  return `${visible}${masked}@${domain}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = findIdSchema.safeParse(body);
    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { nickname, boothName } = parsed.data;

    const supabaseAdmin = getSupabaseAdmin();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabaseAdmin.from("users") as any)
      .select("email")
      .eq("nickname", nickname);

    if (boothName) {
      query = query.eq("booth_name", boothName);
    }

    const { data, error: queryError } = await query.maybeSingle();

    if (queryError) {
      return NextResponse.json(
        { error: "아이디 찾기에 실패했습니다." },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "일치하는 회원 정보를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    return NextResponse.json({ maskedEmail: maskEmail(data.email) });
  } catch {
    return NextResponse.json(
      { error: "아이디 찾기에 실패했습니다." },
      { status: 500 },
    );
  }
}
