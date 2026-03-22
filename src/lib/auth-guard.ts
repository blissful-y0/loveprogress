import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";

interface AuthResult {
  userId: string;
  nickname: string;
  role: UserRole;
}

/**
 * Verify the current session user has one of the allowed roles.
 * Returns the authenticated user info or a NextResponse error.
 */
export async function requireRole(
  allowedRoles: readonly UserRole[],
): Promise<AuthResult | NextResponse> {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json(
      { error: "로그인이 필요합니다." },
      { status: 401 },
    );
  }

  const { data: profile } = await supabase
    .from("users")
    .select("nickname, role")
    .eq("id", authUser.id)
    .single<{ nickname: string; role: string }>();

  if (!profile) {
    return NextResponse.json(
      { error: "사용자 정보를 찾을 수 없습니다." },
      { status: 401 },
    );
  }

  const role = profile.role as UserRole;

  if (!allowedRoles.includes(role)) {
    return NextResponse.json(
      { error: "접근 권한이 없습니다." },
      { status: 403 },
    );
  }

  return {
    userId: authUser.id,
    nickname: profile.nickname,
    role,
  };
}

/** Type guard to check if requireRole returned an error response. */
export function isErrorResponse(
  result: AuthResult | NextResponse,
): result is NextResponse {
  return result instanceof NextResponse;
}
