import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/require-admin";

/**
 * Thin wrapper around requireAdmin — kept for backwards compatibility.
 * Prefer importing from "@/lib/auth/require-admin" for new code.
 */
export async function verifyAdmin(): Promise<
  { userId: string } | NextResponse
> {
  // requireAdmin expects a Request, but only uses it for the signature —
  // internally it creates its own supabase client from cookies.
  const result = await requireAdmin(new Request("http://localhost"));
  if (result.error) return result.error as NextResponse;
  return { userId: result.userId };
}

/** Type guard to check if verifyAdmin returned an error response */
export function isAdminError(
  result: { userId: string } | NextResponse,
): result is NextResponse {
  return result instanceof NextResponse;
}
