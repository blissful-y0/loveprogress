import { NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

interface RateLimitOptions {
  readonly maxRequests: number;
  readonly windowMs: number;
}

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

/**
 * Supabase DB 기반 rate limiting — 서버리스(Vercel) 환경에서도 영속적으로 동작.
 * DB 오류 시 허용(fail-open)하여 서비스 중단을 방지.
 */
export async function rateLimit(
  request: Request,
  endpoint: string,
  options: RateLimitOptions,
): Promise<NextResponse | null> {
  const ip = getClientIp(request);
  const key = `${endpoint}:${ip}`;

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.rpc("increment_rate_limit", {
      p_key: key,
      p_max: options.maxRequests,
      p_window_ms: options.windowMs,
    });

    if (error) {
      // DB 오류 시 요청 허용 (fail-open)
      console.error("Rate limit DB error:", error.message);
      return null;
    }

    const count = data as number;
    if (count > options.maxRequests) {
      return NextResponse.json(
        { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
        { status: 429 },
      );
    }
  } catch (err) {
    // 예외 시 요청 허용 (fail-open)
    console.error("Rate limit error:", err);
    return null;
  }

  return null;
}
