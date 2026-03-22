import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck.error) return adminCheck.error;

  const supabaseAdmin = getSupabaseAdmin();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin.from("users") as any)
    .select("id, nickname, email, booth_name, role, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "회원 목록을 불러오는데 실패했습니다." },
      { status: 500 },
    );
  }

  return NextResponse.json({ data });
}
