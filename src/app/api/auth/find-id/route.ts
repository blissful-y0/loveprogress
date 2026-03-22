import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";

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
  const rateLimitResponse = rateLimit(request, "find-id", {
    maxRequests: 5,
    windowMs: 60 * 1000,
  });
  if (rateLimitResponse) return rateLimitResponse;

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

    // 동명이인 처리: boothName 없이 2건 이상이면 거부
    const { data: rows, error: queryError } = await query;

    if (queryError) {
      return NextResponse.json(
        { error: "아이디 찾기에 실패했습니다." },
        { status: 500 },
      );
    }

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: "일치하는 회원 정보를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    if (rows.length > 1) {
      return NextResponse.json(
        { error: "동일한 닉네임이 여러 개 있습니다. 부스이름을 함께 입력해주세요." },
        { status: 409 },
      );
    }

    return NextResponse.json({ maskedEmail: maskEmail(rows[0].email) });
  } catch {
    return NextResponse.json(
      { error: "아이디 찾기에 실패했습니다." },
      { status: 500 },
    );
  }
}
