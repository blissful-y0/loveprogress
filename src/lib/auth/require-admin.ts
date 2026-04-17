import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type AdminCheckSuccess = { userId: string; error?: never };
type AdminCheckError = { error: Response; userId?: never };

export async function requireAdmin(
  _request: Request,
): Promise<AdminCheckSuccess | AdminCheckError> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 },
      ),
    };
  }

  const supabaseAdmin = getSupabaseAdmin();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile, error: profileError } = await (
    supabaseAdmin.from("users") as any
  )
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "admin") {
    return {
      error: NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 },
      ),
    };
  }

  return { userId: user.id };
}
