import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const DEFAULT_PASSWORD = "702430";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck.error) return adminCheck.error;

  const { id } = await params;

  const supabaseAdmin = getSupabaseAdmin();

  const { error } = await supabaseAdmin.auth.admin.updateUserById(id, {
    password: DEFAULT_PASSWORD,
  });

  if (error) {
    return NextResponse.json(
      { error: "비밀번호 초기화에 실패했습니다." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
