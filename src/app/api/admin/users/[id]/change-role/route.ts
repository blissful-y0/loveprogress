import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/require-admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const changeRoleSchema = z.object({
  role: z.enum(["member", "booth_member", "admin"]),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck.error) return adminCheck.error;

  const { id } = await params;

  if (!UUID_RE.test(id)) {
    return NextResponse.json(
      { error: "올바른 사용자 ID가 아닙니다." },
      { status: 400 },
    );
  }

  if (id === adminCheck.userId) {
    return NextResponse.json(
      { error: "자신의 역할은 변경할 수 없습니다." },
      { status: 400 },
    );
  }

  try {
    const body = await request.json();
    const parsed = changeRoleSchema.safeParse(body);

    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabaseAdmin.from("users") as any)
      .update({ role: parsed.data.role })
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "역할 변경에 실패했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "잘못된 요청입니다." },
      { status: 400 },
    );
  }
}
