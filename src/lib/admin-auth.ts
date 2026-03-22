import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Verify that the current request is from an authenticated admin user.
 * Returns the user ID on success, or a NextResponse error on failure.
 */
export async function verifyAdmin(): Promise<
  { userId: string } | NextResponse
> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "인증이 필요합니다." },
      { status: 401 },
    );
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single<{ role: string }>();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json(
      { error: "관리자 권한이 필요합니다." },
      { status: 403 },
    );
  }

  return { userId: user.id };
}

/** Type guard to check if verifyAdmin returned an error response */
export function isAdminError(
  result: { userId: string } | NextResponse,
): result is NextResponse {
  return result instanceof NextResponse;
}
