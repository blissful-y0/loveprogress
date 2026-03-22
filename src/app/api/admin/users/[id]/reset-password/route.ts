import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

  const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD ?? "702430";
  const supabaseAdmin = getSupabaseAdmin();

  const { error } = await supabaseAdmin.auth.admin.updateUserById(id, {
    password: defaultPassword,
  });

  if (error) {
    return NextResponse.json(
      { error: "비밀번호 초기화에 실패했습니다." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
