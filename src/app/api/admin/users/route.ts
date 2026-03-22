import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck.error) return adminCheck.error;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "20")));
  const offset = (page - 1) * limit;

  const search = searchParams.get("search")?.trim() ?? "";

  const supabaseAdmin = getSupabaseAdmin();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabaseAdmin.from("users") as any).select(
    "id, nickname, email, booth_name, role, created_at",
    { count: "exact" },
  );

  if (search) {
    query = query.or(
      `nickname.ilike.%${search}%,email.ilike.%${search}%`,
    );
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json(
      { error: "회원 목록을 불러오는데 실패했습니다." },
      { status: 500 },
    );
  }

  const total = count ?? 0;
  const totalPages = Math.ceil(total / limit);

  return NextResponse.json({ users: data, total, page, totalPages });
}
